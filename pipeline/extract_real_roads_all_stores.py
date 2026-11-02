#!/usr/bin/env python3
"""
Refined Real Road Network & Corridor Footfall Generator for ALL 13 Apsara Stores in Bangalore
Key Fixes:
1. Hierarchy & Corridor-Driven Footfall:
   - High-street spines (100ft Rd, 27th Main, Sampige Rd, CMH Rd, etc.) carry peak footfall along their entire length.
   - Secondary, tertiary, and residential streets carry realistic traffic based on functional road hierarchy.
   - The store is NOT treated as an artificial epicenter.
2. Removes Square Bounding-Box Cutoff:
   - Replaces the axis-aligned Overpass bounding box with circular walkshed clipping (r <= 1250m) and natural corridor extension.
"""

import os
import json
import time
import numpy as np
import geopandas as gpd
from shapely.geometry import mapping, Point
import osmnx as ox

CACHE_DIR = "cache/osm_graphs"

HOURLY_WEIGHTS = [
    0.012, 0.006, 0.003, 0.002, 0.002, 0.005,  # 00 - 05
    0.015, 0.035, 0.065, 0.078, 0.060, 0.055,  # 06 - 11
    0.072, 0.082, 0.065, 0.055, 0.062, 0.078,  # 12 - 17
    0.098, 0.115, 0.118, 0.102, 0.065, 0.035   # 18 - 23 (Prime evening dessert peak)
]
HOURLY_WEIGHTS = np.array(HOURLY_WEIGHTS) / np.sum(HOURLY_WEIGHTS)

RELEVANT_HIGHWAYS = [
    'primary', 'primary_link', 'secondary', 'secondary_link',
    'tertiary', 'tertiary_link', 'residential', 'living_street', 'pedestrian', 'unclassified', 'trunk', 'trunk_link'
]

# Designated commercial high-street keywords per micro-market
HIGH_STREET_PATTERNS = {
    "Indiranagar": ["100 feet", "100ft", "12th main", "cmh", "chinmaya mission", "indiranagar club", "metro", "80 feet"],
    "HSR Layout": ["27th main", "19th main", "14th main", "sector 1", "sector 2", "agara", "hsr club", "5th main", "24th main"],
    "JP Nagar": ["24th main", "puttenahalli", "15th cross", "16th cross", "sarakki", "brigade millennium", "outer ring road", "phase 5"],
    "Whitefield": ["varthur", "itpl", "siddhapura", "borewell", "whitefield main", "hope farm", "ecc", "inner circle", "outer circle"],
    "Hennur / Kothanur": ["hennur", "kothanur", "petra", "geddalahalli", "bagalur", "byrathi"],
    "Bellandur": ["green glen", "outer ring road", "orr", "ecospace", "devarabisanahalli", "bellandur main", "sobha"],
    "Koramangala": ["80 feet", "80ft", "1st a main", "100 feet", "5th block", "jyoti nivas", "khb", "koramangala club", "7th block"],
    "Yelahanka": ["mother dairy", "yelahanka main", "nes", "attur", "kogilu", "new town"],
    "Malleshwaram": ["sampige", "margosa", "8th cross", "4th cross", "5th cross", "11th cross", "malleshwaram circle", "18th cross", "2nd main"],
    "Vidyaranyapura": ["nanjappa", "thindlu", "bel layout", "vidyaranyapura main", "bel market"],
    "Banashankari": ["80 feet", "30th main", "kathreguppe", "kamakhya", "banashankari 3rd", "ring road", "7th block"],
    "Jayanagar": ["30th cross", "11th main", "maiyas", "cool joint", "4th block", "9th main", "south end", "32nd cross", "6th c main"],
    "Basavanagudi": ["gandhi bazaar", "dvg", "d.v.g", "bull temple", "tagore circle", "netkallappa", "anjaneya temple", "subbarama chetty"]
}

def is_commercial_high_street(street_name, locality):
    s_lower = str(street_name).lower()
    patterns = HIGH_STREET_PATTERNS.get(locality, [])
    for p in patterns:
        if p in s_lower:
            return True
    return False

def run_refined_extraction():
    with open("data/01_raw/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    print(f"Refining real road networks for all {len(stores)} Apsara locations in Bangalore...\n")

    all_features = []
    catchment_features = []

    for idx, s in enumerate(stores):
        serial = s["serial_no"]
        loc = s["locality"]
        coords = s["coordinates"]
        lat, lon = coords["lat"], coords["lng"]
        corridor_name = s["corridor_name"]
        reg_daily = s["regional_footfall"]["weekday_daily_footfall"]
        reg_wknd = s["regional_footfall"]["weekend_daily_footfall"]
        peak_eve = s["regional_footfall"]["peak_evening_hourly_flow"]
        store_cups = s["store_footfall"]["est_daily_cups"]

        print(f"[{idx+1}/{len(stores)}] {serial} — {loc} ({corridor_name})")

        # 1. 350m High-Density Pedestrian Catchment Zone Polygon
        store_pt_metric = gpd.points_from_xy([lon], [lat], crs="EPSG:4326").to_crs(epsg=32643)[0]
        buf_metric = store_pt_metric.buffer(350)
        buf_geo = gpd.GeoSeries([buf_metric], crs="EPSG:32643").to_crs(epsg=4326)[0]

        catchment_features.append({
            "type": "Feature",
            "properties": {
                "serial_no": serial,
                "locality": loc,
                "store_name": s["store_name"],
                "address": s["address"],
                "corridor_name": corridor_name,
                "google_rating": s["google_rating"],
                "google_review_count": s["google_review_count"],
                "est_daily_cups": store_cups,
                "daily_footfall": reg_daily,
                "weekend_daily_footfall": reg_wknd,
                "peak_evening_hourly_flow": peak_eve
            },
            "geometry": mapping(buf_geo)
        })

        # 2. Load cached graph
        cache_path = os.path.join(CACHE_DIR, f"{serial}.graphml")
        if not os.path.exists(cache_path):
            print(f"   Downloading graph for {serial}...")
            G = ox.graph_from_point((lat, lon), dist=1300, network_type="all")
            ox.save_graphml(G, cache_path)
        else:
            G = ox.load_graphml(cache_path)

        gdf_edges = ox.graph_to_gdfs(G, nodes=False)
        filtered = gdf_edges[gdf_edges['highway'].isin(RELEVANT_HIGHWAYS)].copy()
        gdf_metric = filtered.to_crs(epsg=32643)

        store_edge_count = 0
        corridor_count = 0

        for _, row in gdf_metric.iterrows():
            geom_metric = row.geometry
            centroid_m = geom_metric.centroid
            d_to_center = float(centroid_m.distance(store_pt_metric))
            d_to_store = float(geom_metric.distance(store_pt_metric))

            raw_name = row.get('name')
            if isinstance(raw_name, list):
                raw_name = raw_name[0]
            if not raw_name or str(raw_name) == 'nan':
                raw_name = f"{loc} Street"

            hw = row.get('highway', 'residential')
            if isinstance(hw, list):
                hw = hw[0]

            is_high_street = is_commercial_high_street(raw_name, loc)

            # Circular Walkshed Clipping: Remove the artificial square box
            # High-streets can extend up to 1350m, neighborhood streets clipped at 1150m
            max_r = 1350.0 if (is_high_street or hw in ['primary', 'trunk']) else 1150.0
            if d_to_center > max_r:
                continue

            # Footfall calculation based on structural road hierarchy & corridor identity
            if is_high_street:
                # Prime commercial corridor: Peak traffic across its entire length
                corridor_count += 1
                base_traffic = int(reg_daily * 0.46)
                is_prime = True
                tier_label = "Designated High-Street Corridor"
            elif hw in ['primary', 'primary_link', 'trunk', 'trunk_link']:
                # Primary Arterial
                base_traffic = int(reg_daily * 0.36)
                is_prime = True
                tier_label = "Primary Arterial Corridor"
            elif hw in ['secondary', 'secondary_link']:
                # Secondary Commercial Spine
                base_traffic = int(reg_daily * 0.24)
                is_prime = (d_to_store <= 350)
                tier_label = "Secondary Commercial Spine"
            elif hw in ['tertiary', 'tertiary_link']:
                # Neighborhood Collector
                base_traffic = int(reg_daily * 0.12)
                is_prime = False
                tier_label = "Neighborhood Collector"
            else:
                # Quiet Residential / Living Street
                base_traffic = int(max(650, reg_daily * 0.04))
                is_prime = False
                tier_label = "Residential Street"

            hourly = [int(base_traffic * HOURLY_WEIGHTS[h]) for h in range(24)]

            # Reproject line to 4326
            line_geo = gpd.GeoSeries([geom_metric], crs="EPSG:32643").to_crs(epsg=4326)[0]

            feat = {
                "type": "Feature",
                "properties": {
                    "street_id": f"ST_{serial}_{store_edge_count+1:04d}",
                    "serial_no": serial,
                    "locality": loc,
                    "corridor_name": corridor_name,
                    "street_name": str(raw_name),
                    "highway_type": str(hw),
                    "corridor_tier": tier_label,
                    "length_m": float(round(float(row.get('length', 50)), 1)),
                    "daily_footfall": int(base_traffic),
                    "peak_hourly_footfall": int(max(hourly)),
                    "hourly_footfall": hourly,
                    "is_prime_corridor": bool(is_prime),
                    "dist_to_store_m": float(round(d_to_store, 1))
                },
                "geometry": mapping(line_geo)
            }
            all_features.append(feat)
            store_edge_count += 1

        print(f"   ✓ Processed {store_edge_count} natural road segments ({corridor_count} high-street segments) for {loc}.\n")

    # Export to GeoJSON
    out_dir = "frontend/public/data"
    proc_dir = "data/03_processed_h3"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(proc_dir, exist_ok=True)

    streets_fc = {
        "type": "FeatureCollection",
        "name": "all_stores_street_footfall",
        "features": all_features
    }

    catchments_fc = {
        "type": "FeatureCollection",
        "name": "apsara_store_footfall_catchments",
        "features": catchment_features
    }

    with open(f"{out_dir}/all_stores_street_footfall.geojson", "w") as f:
        json.dump(streets_fc, f)

    with open(f"{out_dir}/apsara_store_footfall_catchments.geojson", "w") as f:
        json.dump(catchments_fc, f)

    with open(f"{proc_dir}/all_stores_street_footfall.geojson", "w") as f:
        json.dump(streets_fc, f)

    with open(f"{proc_dir}/apsara_store_footfall_catchments.geojson", "w") as f:
        json.dump(catchments_fc, f)

    print(f"===========================================================")
    print(f"🎉 COMPLETED: Refined {len(all_features)} real road segments across ALL {len(stores)} locations!")
    print(f"🎉 Removed square box cutoffs: Applied circular walkshed boundary.")
    print(f"🎉 Fixed epicenter: High-street spines sustain peak footfall along their entire length.")
    print(f"===========================================================\n")

if __name__ == "__main__":
    run_refined_extraction()
