#!/usr/bin/env python3
"""
Pipeline Module 02: H3 Hexagonal Tessellation & Demographic Footfall Modeling
Tessellates the Bengaluru BBMP region into Uber H3 cells, computes spatial KDE
footfall synergy, population density surface, youth affluence index, and competitor metrics.
"""

import os
import sys
import json
import logging
import math
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon, Point
from scipy.spatial import cKDTree
import h3

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/overnight_execution.log", mode="a")
    ]
)
logger = logging.getLogger("demographics_footfall")

os.makedirs("data/03_processed_h3", exist_ok=True)

# Load configuration
with open("config/study_area_bbmp.json", "r") as f:
    config = json.load(f)

BBOX = config["study_area"]["bounding_box"]
PROJECTED_CRS = config["study_area"]["projected_crs"]
GEO_CRS = config["study_area"]["geographic_crs"]
RES = config["study_area"].get("h3_resolution_macro", 8)
MICRO_MARKETS = config["key_micro_markets"]

def run_demographics():
    logger.info(f"Starting Task 2.2: H3 Tessellation at Resolution {RES}...")
    
    # 1. Generate H3 Grid over Bengaluru Bounding Box
    poly = h3.LatLngPoly([
        (BBOX["min_lat"], BBOX["min_lon"]),
        (BBOX["max_lat"], BBOX["min_lon"]),
        (BBOX["max_lat"], BBOX["max_lon"]),
        (BBOX["min_lat"], BBOX["max_lon"])
    ])
    hex_ids = list(h3.polygon_to_cells(poly, RES))
    logger.info(f"Generated {len(hex_ids)} H3 Resolution-{RES} cells across Bengaluru.")

    # 2. Extract Centroids & Hexagon Geometries
    hex_data = []
    centroids_geom = []
    polygons_geom = []

    for hid in hex_ids:
        lat, lon = h3.cell_to_latlng(hid)
        boundary = h3.cell_to_boundary(hid) # list of (lat, lng)
        coords = [(pt[1], pt[0]) for pt in boundary]
        coords.append(coords[0]) # close polygon
        
        hex_data.append({
            "h3_index": hid,
            "centroid_lat": lat,
            "centroid_lon": lon
        })
        centroids_geom.append(Point(lon, lat))
        polygons_geom.append(Polygon(coords))

    gdf_h3 = gpd.GeoDataFrame(hex_data, geometry=polygons_geom, crs=GEO_CRS)
    gdf_centroids = gpd.GeoDataFrame(hex_data, geometry=centroids_geom, crs=GEO_CRS)

    # Project to metric CRS EPSG:32643
    gdf_centroids_proj = gdf_centroids.to_crs(PROJECTED_CRS)
    h3_proj_coords = np.column_stack([gdf_centroids_proj.geometry.x, gdf_centroids_proj.geometry.y])

    # 3. Load Competitors & Synergy POIs
    competitors_path = "data/02_intermediate/competitors.parquet"
    synergy_path = "data/02_intermediate/synergy_pois.parquet"

    if not os.path.exists(competitors_path):
        raise FileNotFoundError(f"Missing {competitors_path}. Run module 01 first.")

    gdf_comp = gpd.read_parquet(competitors_path).to_crs(PROJECTED_CRS)
    gdf_synergy = gpd.read_parquet(synergy_path).to_crs(PROJECTED_CRS)

    comp_coords = np.column_stack([gdf_comp.geometry.x, gdf_comp.geometry.y])
    comp_tree = cKDTree(comp_coords)

    t1_comp = gdf_comp[gdf_comp["tier"] == "Tier_1_Destination"]
    t1_coords = np.column_stack([t1_comp.geometry.x, t1_comp.geometry.y])
    t1_tree = cKDTree(t1_coords) if len(t1_coords) > 0 else comp_tree

    syn_coords = np.column_stack([gdf_synergy.geometry.x, gdf_synergy.geometry.y])
    syn_weights = gdf_synergy["synergy_weight"].values
    syn_tree = cKDTree(syn_coords)

    # 4. Compute Distance & Density Metrics for each H3 cell
    logger.info("Computing spatial metrics and KDTree queries...")
    
    # Distance to nearest Tier-1 and general competitor
    d_t1, _ = t1_tree.query(h3_proj_coords, k=1)
    d_all, _ = comp_tree.query(h3_proj_coords, k=3)
    
    # Competitor count within 1 km (1000m) and 2 km (2000m)
    comp_count_1km = [len(idxs) for idxs in comp_tree.query_ball_point(h3_proj_coords, r=1000.0)]
    comp_count_2km = [len(idxs) for idxs in comp_tree.query_ball_point(h3_proj_coords, r=2000.0)]

    # 5. Model Population Density Surface
    # Bengaluru population distribution: Central & Established south/west high density (16k - 24k /km2),
    # Outer suburbs 6k - 12k /km2, tech corridors have high daytime floating + residential population.
    pop_densities = []
    youth_affluence = []
    footfall_synergy = []

    # Pre-project micro-market centers
    mm_gdf = gpd.GeoDataFrame(
        MICRO_MARKETS,
        geometry=[Point(m["lon"], m["lat"]) for m in MICRO_MARKETS],
        crs=GEO_CRS
    ).to_crs(PROJECTED_CRS)
    mm_coords = np.column_stack([mm_gdf.geometry.x, mm_gdf.geometry.y])

    # Tech corridor centers for affluence weighting
    tech_zones = ["Indiranagar", "Koramangala", "HSR", "Whitefield", "Bellandur", "Electronic City", "Hebbal", "Kammanahalli"]

    for i in range(len(gdf_h3)):
        c_x, c_y = h3_proj_coords[i]
        
        # Distance to micro-market centers
        dists_mm = np.sqrt(np.sum((mm_coords - np.array([c_x, c_y]))**2, axis=1))
        min_mm_dist = np.min(dists_mm)
        nearest_mm_idx = np.argmin(dists_mm)
        nearest_mm = MICRO_MARKETS[nearest_mm_idx]

        # Population density model: Base + distance decay to commercial/residential hubs
        # Real Bengaluru urban core density ~ 14,000 to 26,000 / km²
        kernel_pop = np.sum(np.exp(- (dists_mm / 3500.0)**2) * 12000.0)
        base_pop = 6500.0 + min(22000.0, kernel_pop)
        # Add slight spatial variation
        noise_factor = 0.9 + 0.2 * ((math.sin(c_x / 800.0) * math.cos(c_y / 800.0) + 1.0) / 2.0)
        pop_dens = round(base_pop * noise_factor, 1)
        pop_densities.append(pop_dens)

        # Youth & Affluence Index (0 - 100)
        # Higher near tech corridors, colleges, and high-street dining
        is_tech = any(tz.lower() in nearest_mm["name"].lower() for tz in tech_zones)
        base_affluence = 65.0 if is_tech else 45.0
        prox_boost = max(0.0, 35.0 * math.exp(-min_mm_dist / 2800.0))
        affluence_score = min(98.5, round(base_affluence + prox_boost, 1))
        youth_affluence.append(affluence_score)

        # Spatial Footfall Synergy KDE (using surrounding POIs within 2.5 km)
        poi_idxs = syn_tree.query_ball_point([c_x, c_y], r=2500.0)
        if len(poi_idxs) > 0:
            poi_sub_coords = syn_coords[poi_idxs]
            poi_sub_weights = syn_weights[poi_idxs]
            dists_poi = np.sqrt(np.sum((poi_sub_coords - np.array([c_x, c_y]))**2, axis=1))
            # Gaussian kernel decay (bandwidth = 1200m)
            kde_val = np.sum(poi_sub_weights * np.exp(- (dists_poi / 1200.0)**2))
        else:
            kde_val = 0.1
        footfall_synergy.append(kde_val)

    # Normalize footfall synergy to 0 - 100 scale
    syn_max = max(footfall_synergy) if max(footfall_synergy) > 0 else 1.0
    syn_norm = [round((val / syn_max) * 100.0, 2) for val in footfall_synergy]

    # Competitor saturation penalty decay: sum(attractiveness / dist^1.8)
    comp_saturation_decay = []
    for i in range(len(gdf_h3)):
        c_x, c_y = h3_proj_coords[i]
        c_idxs = comp_tree.query_ball_point([c_x, c_y], r=3000.0)
        if len(c_idxs) > 0:
            c_sub = comp_coords[c_idxs]
            dists = np.sqrt(np.sum((c_sub - np.array([c_x, c_y]))**2, axis=1))
            dists_clamped = np.maximum(dists, 150.0) # avoid division by 0
            decay = np.sum(1000.0 / (dists_clamped ** 1.4))
        else:
            decay = 0.05
        comp_saturation_decay.append(decay)

    sat_max = max(comp_saturation_decay) if max(comp_saturation_decay) > 0 else 1.0
    sat_norm = [round((val / sat_max) * 100.0, 2) for val in comp_saturation_decay]

    # Assign columns to GeoDataFrame
    gdf_h3["pop_density_km2"] = pop_densities
    gdf_h3["youth_affluence_index"] = youth_affluence
    gdf_h3["footfall_synergy_score"] = syn_norm
    gdf_h3["competitor_saturation"] = sat_norm
    gdf_h3["competitor_count_1km"] = comp_count_1km
    gdf_h3["competitor_count_2km"] = comp_count_2km
    gdf_h3["nearest_tier1_dist_m"] = [round(float(d), 1) for d in d_t1]
    gdf_h3["nearest_comp_dist_m"] = [round(float(d[0]), 1) for d in d_all]

    # Save to Parquet
    out_path = "data/03_processed_h3/h3_demographics.parquet"
    logger.info(f"Saving {len(gdf_h3)} H3 cells to {out_path}...")
    gdf_h3.to_parquet(out_path)
    
    logger.info("Task 2.2 Complete: H3 Demographic & Footfall modeling finished.")
    return len(gdf_h3)

if __name__ == "__main__":
    run_demographics()
