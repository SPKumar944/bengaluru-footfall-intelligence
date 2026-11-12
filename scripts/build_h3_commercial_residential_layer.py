#!/usr/bin/env python3
"""
build_h3_commercial_residential_layer.py
========================================
Builds the authoritative H3 Resolution 9 Hexagon dataset for Bengaluru:
- Matches the exact measurements and resolution of the demographics layer (H3 Res 9)
- Integrates residential built-up (m2), residential volume (m3), resident population,
  workforce, office floor space (m2), office records, demographics (kids, youth, adults),
  and proximity to the 13 canonical Apsara stores.
- Computes normalized indices:
  * Residential Index (0-100)
  * Commercial / Industrial Index (0-100)
  * Retail Footfall Synergy Index (0-100)
  * Classification: 'commercial' | 'residential' | 'industrial' | 'mixed'
"""

import json
import math
import os
import pandas as pd

def compute_distance(lat1, lon1, lat2, lon2):
    """Approximate distance in meters between two lat/lon points."""
    dlat = (lat2 - lat1) * 111000.0
    dlon = (lon2 - lon1) * 111000.0 * math.cos(math.radians(lat1))
    return math.hypot(dlat, dlon)

def main():
    print("Loading source datasets...")
    df_weights = pd.read_parquet("extracted_drive_data/02_population_and_workforce/source_cell_weights.parquet")
    df_built = pd.read_parquet("extracted_drive_data/03_supporting_inputs/residential_builtup.parquet")
    df_vol = pd.read_parquet("extracted_drive_data/03_supporting_inputs/residential_volume.parquet")
    df_offices = pd.read_parquet("extracted_drive_data/03_supporting_inputs/open_source_office_records.parquet")

    # Office count per H3
    office_counts = df_offices.groupby("h3").size().to_dict()

    # Hexagon demographics
    with open("frontend/public/data/hexagon_demographics.json") as f:
        demo = json.load(f)
    demo_map = {d["h"]: d for d in demo}

    # Canonical 13 Apsara Stores
    with open("frontend/public/data/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    # Merge
    print("Merging spatial layers...")
    df = df_weights.merge(df_built[["h3", "dw2025_built_m2"]], on="h3", how="left").fillna(0)
    df = df.merge(df_vol[["h3", "v2023_res_m3"]], on="h3", how="left").fillna(0)

    # Filter active cells (population > 0 or workers > 0 or office > 0 or office_count > 0)
    df["office_count"] = df["h3"].map(office_counts).fillna(0).astype(int)
    
    # Max values for normalization
    # Res pop 99th percentile ~ 6,500
    # Com workers 99th percentile ~ 20,000
    # Office m2 99th percentile ~ 250,000
    res_pop_cap = 6000.0
    com_workers_cap = 15000.0
    off_m2_cap = 150000.0

    hexagons = []

    for _, row in df.iterrows():
        h = row["h3"]
        lat = float(row["latitude"])
        lng = float(row["longitude"])
        
        # Base numericals
        res_pop = float(row["estimated_residents"])
        com_workers = float(row["estimated_workers"])
        off_m2 = float(row["office_floor_m2"])
        res_built_m2 = float(row["dw2025_built_m2"])
        res_vol_m3 = float(row["v2023_res_m3"])
        off_cnt = int(row["office_count"])

        # Skip completely empty non-urban cells
        if res_pop < 2.0 and com_workers < 1.0 and off_m2 < 10.0 and off_cnt == 0:
            continue

        # Demographics breakdown
        d_info = demo_map.get(h, {})
        kids = int(d_info.get("k", round(res_pop * 0.20)))
        youth = int(d_info.get("y", round(res_pop * 0.18)))
        ward_name = d_info.get("w_name") or ""

        # Find nearest Apsara store
        min_dist = 999999.0
        nearest_store_sn = "APSARA_BLR_01"
        nearest_store_name = "HSR Layout"
        for s in stores:
            slat = s["coordinates"]["lat"]
            slng = s["coordinates"]["lng"]
            dist = compute_distance(lat, lng, slat, slng)
            if dist < min_dist:
                min_dist = dist
                nearest_store_sn = s["serial_no"]
                nearest_store_name = s["locality"]

        # If ward_name is empty, use nearest store locality
        if not ward_name:
            ward_name = f"{nearest_store_name} Vicinity"

        # Normalized Indices (0 - 100)
        res_index = min(100, max(0, int(round((res_pop / res_pop_cap) * 100))))
        com_worker_score = (com_workers / com_workers_cap) * 100
        off_space_score = (off_m2 / off_m2_cap) * 100
        com_index = min(100, max(0, int(round(max(com_worker_score, off_space_score)))))
        
        # If office count is high, bump commercial index
        if off_cnt >= 3 and com_index < 35:
            com_index = min(100, com_index + off_cnt * 8)

        # Classification / Land Use Type
        # industrial: massive office floor space or workers (IT corridor / corporate parks)
        if off_m2 >= 18000 or com_workers >= 1200 or (off_cnt >= 5 and off_m2 >= 8000):
            classification = "industrial"
        # commercial: significant workforce or office space, or high office POI density
        elif com_workers >= 120 or off_m2 >= 2000 or off_cnt >= 2:
            if res_pop >= 350 and com_workers >= 100:
                classification = "mixed"
            else:
                classification = "commercial"
        # mixed: high retail/dining blend with resident population
        elif com_workers >= 40 and res_pop >= 200:
            classification = "mixed"
        # residential: dominated by residents and housing footprint
        elif res_pop >= 40 or res_built_m2 >= 1000:
            classification = "residential"
        else:
            classification = "residential"

        # Retail & Ice Cream Footfall Synergy Index (0 - 100)
        # Combines evening residential family demand + commercial lunchtime/tea demand + proximity to core corridors
        family_factor = min(100, (kids / 400.0) * 100)
        proximity_boost = max(0, int((1.0 - min(1.0, min_dist / 3000.0)) * 25))
        
        if classification in ("commercial", "industrial"):
            raw_syn = (com_index * 0.65) + (res_index * 0.35) + proximity_boost
        elif classification == "mixed":
            raw_syn = (com_index * 0.50) + (res_index * 0.50) + 10 + proximity_boost
        else:
            raw_syn = (res_index * 0.60) + (family_factor * 0.40) + proximity_boost
            
        synergy_index = min(100, max(15, int(round(raw_syn))))

        hex_obj = {
            "h": h,
            "cls": classification, # 'com' | 'res' | 'ind' | 'mix'
            "res_pop": int(round(res_pop)),
            "res_built_m2": int(round(res_built_m2)),
            "res_vol_m3": int(round(res_vol_m3)),
            "kids": kids,
            "youth": youth,
            "com_workers": int(round(com_workers)),
            "off_m2": int(round(off_m2)),
            "off_cnt": off_cnt,
            "res_idx": res_index,
            "com_idx": com_index,
            "syn_idx": synergy_index,
            "ward": ward_name,
            "store": nearest_store_sn,
            "dist": int(round(min_dist))
        }
        hexagons.append(hex_obj)

    print(f"Total active hexagons: {len(hexagons)}")
    
    # Classification breakdown
    cls_counts = {}
    for x in hexagons:
        cls_counts[x["cls"]] = cls_counts.get(x["cls"], 0) + 1
    print("Breakdown by classification:", cls_counts)

    payload = {
        "metadata": {
            "title": "Bengaluru Commercial & Residential Land Use Hexagons (H3 Res 9)",
            "description": "Uber H3 Resolution 9 spatial hexagons with normalized Residential, Commercial/Industrial, and Retail Synergy indices matching the demographics measurement system.",
            "h3_resolution": 9,
            "edge_length_m": 105,
            "hexagon_diameter_m": 210,
            "cell_area_km2": 0.10,
            "total_hexagons": len(hexagons),
            "counts": cls_counts,
            "generated_at": "2026-11-12T11:45:00+05:30"
        },
        "hexagons": hexagons
    }

    out_paths = [
        "frontend/public/data/h3_commercial_residential_indices.json",
        "frontend/dist/data/h3_commercial_residential_indices.json",
        "data/03_processed_h3/h3_commercial_residential_indices.json",
        "staged_deliverables/Bengaluru_Apsara_Retail_Footfall_Intelligence/02_Master_Datasets_and_Layers/h3_commercial_residential_indices.json"
    ]

    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(payload, f)
        print(f"Saved: {p} ({os.path.getsize(p)/1024:.1f} KB)")

    print("Complete!")

if __name__ == "__main__":
    main()
