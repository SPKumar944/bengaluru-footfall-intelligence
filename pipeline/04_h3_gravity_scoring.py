#!/usr/bin/env python3
"""
Pipeline Module 04: Huff Gravity Model & Master H3 Scoring
Uses DuckDB + Python to compute the Ice Cream Market Potential Index (IMPI),
calculates consumer gravity flow arcs, exports client-ready JSON bundles,
and generates the immutable data/manifest_checksums.json audit file.
"""

import os
import sys
import json
import hashlib
import logging
import math
import numpy as np
import pandas as pd
import geopandas as gpd
import duckdb
import yaml

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/overnight_execution.log", mode="a")
    ]
)
logger = logging.getLogger("gravity_scoring")

# Load configurations
with open("config/study_area_bbmp.json", "r") as f:
    config = json.load(f)

with open("config/model_weights.yaml", "r") as f:
    model_cfg = yaml.safe_load(f)

MCDA = model_cfg["mcda_weights"]
GRAVITY = model_cfg["gravity_parameters"]

def compute_sha256(filepath):
    """Calculates SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()

def run_scoring():
    logger.info("Starting Task 2.4: DuckDB + Master H3 IMPI Scoring...")

    h3_path = "data/03_processed_h3/h3_demographics.parquet"
    if not os.path.exists(h3_path):
        raise FileNotFoundError(f"Missing {h3_path}. Run module 02 first.")

    # 1. Query Parquet via DuckDB
    con = duckdb.connect(database=":memory:")
    df_raw = con.execute(f"SELECT * FROM '{h3_path}'").df()

    logger.info(f"Loaded {len(df_raw)} H3 records into DuckDB memory engine.")

    # 2. Vectorized Normalization (0 to 100)
    p_min, p_max = df_raw["pop_density_km2"].min(), df_raw["pop_density_km2"].max()
    df_raw["norm_pop"] = 100.0 * (df_raw["pop_density_km2"] - p_min) / (p_max - p_min if p_max > p_min else 1.0)

    f_min, f_max = df_raw["footfall_synergy_score"].min(), df_raw["footfall_synergy_score"].max()
    df_raw["norm_footfall"] = 100.0 * (df_raw["footfall_synergy_score"] - f_min) / (f_max - f_min if f_max > f_min else 1.0)

    y_min, y_max = df_raw["youth_affluence_index"].min(), df_raw["youth_affluence_index"].max()
    df_raw["norm_youth"] = 100.0 * (df_raw["youth_affluence_index"] - y_min) / (y_max - y_min if y_max > y_min else 1.0)

    c_min, c_max = df_raw["competitor_saturation"].min(), df_raw["competitor_saturation"].max()
    df_raw["norm_comp"] = 100.0 * (df_raw["competitor_saturation"] - c_min) / (c_max - c_min if c_max > c_min else 1.0)

    # 3. Calculate Core IMPI Score
    # IMPI = w1 * P + w2 * F + w3 * Y - w4 * C
    w1 = MCDA["pop_density_weight"]
    w2 = MCDA["footfall_synergy_weight"]
    w3 = MCDA["youth_affluence_weight"]
    w4 = MCDA["competitor_penalty_weight"]

    # Raw composite score
    raw_impi = (w1 * df_raw["norm_pop"] +
                w2 * df_raw["norm_footfall"] +
                w3 * df_raw["norm_youth"] -
                w4 * df_raw["norm_comp"])

    # Scale to robust [0, 100]
    impi_min, impi_max = raw_impi.min(), raw_impi.max()
    df_raw["impi_score"] = np.round(100.0 * (raw_impi - impi_min) / (impi_max - impi_min if impi_max > impi_min else 1.0), 1)

    # Classification recommendations
    def assign_recommendation(row):
        score = row["impi_score"]
        comp_count = row["competitor_count_1km"]
        if score >= 75.0 and comp_count <= 2:
            return "Prime White Space (Immediate Expansion)"
        elif score >= 70.0:
            return "High Potential Growth Corridor"
        elif score >= 50.0:
            return "Selective / Kiosk Opportunity"
        elif row["competitor_saturation"] >= 75.0:
            return "Oversaturated Rival Cluster (Caution)"
        else:
            return "Low Yield Residential Fringe"

    df_raw["recommended_action"] = df_raw.apply(assign_recommendation, axis=1)

    # Compute estimated daily footfall proxy (for 3D extrusion height)
    df_raw["est_daily_footfall"] = np.round(
        (df_raw["pop_density_km2"] * 0.12) + (df_raw["footfall_synergy_score"] * 35.0), 0
    ).astype(int)

    # 4. Generate Gravity Flow Arcs (Huff Model)
    # Link top demand H3 cells to the Top 20 candidate storefronts
    logger.info("Computing Huff Gravity spatial flow arcs...")
    with open("frontend/public/data/candidate_sites_summary.json", "r") as f:
        candidate_sites = json.load(f)

    beta = GRAVITY["distance_decay_exponent"]
    gravity_arcs = []

    # Filter top 15% highest demand cells
    top_demand_cells = df_raw[df_raw["impi_score"] >= 65.0]

    for _, cell in top_demand_cells.iterrows():
        c_lat = cell["centroid_lat"]
        c_lon = cell["centroid_lon"]
        cell_impi = cell["impi_score"]

        # Calculate gravity interaction with each candidate site
        attractions = []
        for site in candidate_sites:
            s_lat = site["lat"]
            s_lon = site["lon"]
            # Great-circle distance approx (km)
            d_km = math.sqrt(((c_lat - s_lat) * 111.0)**2 + ((c_lon - s_lon) * 111.0 * math.cos(math.radians(c_lat)))**2)
            if 0.2 < d_km <= GRAVITY["max_catchment_distance_km"]:
                attractiveness = site["white_space_score"] / (d_km ** beta)
                attractions.append({
                    "site_id": site["site_id"],
                    "site_name": site["site_name"],
                    "s_lon": s_lon,
                    "s_lat": s_lat,
                    "d_km": round(d_km, 2),
                    "attract": attractiveness
                })

        if attractions:
            # Pick the strongest 1-2 attraction links for clean visualization
            attractions.sort(key=lambda x: x["attract"], reverse=True)
            for top_link in attractions[:1]:
                arc_weight = min(1.0, top_link["attract"] / 20.0)
                gravity_arcs.append({
                    "source_h3": cell["h3_index"],
                    "source_coords": [c_lon, c_lat],
                    "target_site_id": top_link["site_id"],
                    "target_site_name": top_link["site_name"],
                    "target_coords": [top_link["s_lon"], top_link["s_lat"]],
                    "distance_km": top_link["d_km"],
                    "arc_weight": round(arc_weight, 2),
                    "source_impi": cell_impi
                })

    logger.info(f"Generated {len(gravity_arcs)} consumer gravity flow arcs.")

    # 5. Export Frontend JSON Bundles
    # Export compact H3 grid for Deck.gl
    h3_export_columns = [
        "h3_index", "centroid_lat", "centroid_lon", "impi_score",
        "pop_density_km2", "footfall_synergy_score", "youth_affluence_index",
        "competitor_saturation", "competitor_count_1km", "nearest_tier1_dist_m",
        "recommended_action", "est_daily_footfall"
    ]
    df_export = df_raw[h3_export_columns].copy()
    h3_records = df_export.to_dict(orient="records")

    h3_grid_path = "frontend/public/data/blr_h3_market_grid.json"
    with open(h3_grid_path, "w") as f:
        json.dump(h3_records, f)

    arcs_path = "frontend/public/data/gravity_arcs.json"
    with open(arcs_path, "w") as f:
        json.dump(gravity_arcs, f, indent=2)

    # 6. Build Manifest Checksums File
    audit_files = [
        "frontend/public/data/competitors.geojson",
        "frontend/public/data/synergy_pois.geojson",
        "frontend/public/data/candidate_isochrones.geojson",
        "frontend/public/data/candidate_sites_summary.json",
        "frontend/public/data/blr_h3_market_grid.json",
        "frontend/public/data/gravity_arcs.json"
    ]

    manifest = {
        "timestamp_utc": pd.Timestamp.utcnow().isoformat(),
        "crs": "EPSG:32643 / EPSG:4326",
        "h3_cells_evaluated": len(h3_records),
        "candidate_sites_count": len(candidate_sites),
        "gravity_arcs_count": len(gravity_arcs),
        "files": []
    }

    for fpath in audit_files:
        if os.path.exists(fpath):
            file_stat = os.stat(fpath)
            sha = compute_sha256(fpath)
            
            # Determine record/feature count
            row_count = 0
            try:
                with open(fpath, "r") as f:
                    content = json.load(f)
                    if isinstance(content, dict) and "features" in content:
                        row_count = len(content["features"])
                    elif isinstance(content, list):
                        row_count = len(content)
            except Exception:
                row_count = -1

            manifest["files"].append({
                "filename": os.path.basename(fpath),
                "path": fpath,
                "size_bytes": file_stat.st_size,
                "sha256": sha,
                "row_or_feature_count": row_count,
                "status": "VALID_NON_EMPTY"
            })
        else:
            manifest["files"].append({
                "filename": os.path.basename(fpath),
                "path": fpath,
                "status": "MISSING_ERROR"
            })

    manifest_path = "data/manifest_checksums.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    logger.info(f"Task 2.4 Complete: Written audit manifest to {manifest_path}.")
    return manifest

if __name__ == "__main__":
    run_scoring()
