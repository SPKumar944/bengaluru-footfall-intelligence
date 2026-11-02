#!/usr/bin/env python3
"""
Extract Real Road Networks and Calculate Street-Level Footfall for ALL 13 Apsara Stores in Bangalore
Exactly matches the Indiranagar methodology:
- Uses OSMnx to extract real OpenStreetMap road geometries for each neighborhood (dist=1300m)
- Disk-caches graphs in cache/ to prevent redundant Overpass requests
- Applies road-level distance decay, corridor calibration, and 24-hr diurnal footfall curves
"""

import os
import sys
import json
import time
import numpy as np
import geopandas as gpd
from shapely.geometry import mapping, Point
import osmnx as ox

# Configure OSMnx
ox.settings.use_cache = True
ox.settings.log_console = False

CACHE_DIR = "cache/osm_graphs"
os.makedirs(CACHE_DIR, exist_ok=True)

HOURLY_WEIGHTS = [
    0.012, 0.006, 0.003, 0.002, 0.002, 0.005,  # 00 - 05
    0.015, 0.035, 0.065, 0.078, 0.060, 0.055,  # 06 - 11
    0.072, 0.082, 0.065, 0.055, 0.062, 0.078,  # 12 - 17
    0.098, 0.115, 0.118, 0.102, 0.065, 0.035   # 18 - 23 (Prime evening dessert peak)
]
HOURLY_WEIGHTS = np.array(HOURLY_WEIGHTS) / np.sum(HOURLY_WEIGHTS)

RELEVANT_HIGHWAYS = [
    'primary', 'primary_link', 'secondary', 'secondary_link',
    'tertiary', 'tertiary_link', 'residential', 'living_street', 'pedestrian', 'unclassified'
]

def get_or_download_graph(serial, lat, lon, radius=1300):
    cache_path = os.path.join(CACHE_DIR, f"{serial}.graphml")
    if os.path.exists(cache_path):
        print(f"   [Cache Hit] Loading {serial} from {cache_path}...")
        return ox.load_graphml(cache_path)

    print(f"   [Downloading OSM] Fetching real road network for {serial} (dist={radius}m)...")
    for attempt in range(4):
        try:
            G = ox.graph_from_point((lat, lon), dist=radius, network_type="all")
            ox.save_graphml(G, cache_path)
            print(f"   ✓ Saved {len(G.edges)} edges to {cache_path}")
            return G
        except Exception as e:
            wait_s = (attempt + 1) * 6
            print(f"   Attempt {attempt+1} failed: {e}. Retrying in {wait_s}s...")
            time.sleep(wait_s)

    raise RuntimeError(f"Failed to download road network for {serial} after 4 attempts.")

def run_extraction():
    with open("data/01_raw/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    print(f"Processing real road networks & footfall for all {len(stores)} Apsara locations...\n")

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

        # 2. Extract real roads via OSMnx
        try:
            G = get_or_download_graph(serial, lat, lon, radius=1300)
            gdf_edges = ox.graph_to_gdfs(G, nodes=False)

            # Filter relevant roads
            filtered = gdf_edges[gdf_edges['highway'].isin(RELEVANT_HIGHWAYS)].copy()
            gdf_metric = filtered.to_crs(epsg=32643)

            store_edge_count = 0
            for _, row in gdf_metric.iterrows():
                geom_metric = row.geometry
                d = float(geom_metric.distance(store_pt_metric))

                # Street name from OSM
                raw_name = row.get('name')
                if isinstance(raw_name, list):
                    raw_name = raw_name[0]
                if not raw_name or str(raw_name) == 'nan':
                    raw_name = f"{loc} Corridor"

                hw = row.get('highway', 'residential')
                if isinstance(hw, list):
                    hw = hw[0]

                # Distance decay and street tier footfall calculation
                # Primary/Secondary roads near store carry the highest footfall
                is_high_tier = hw in ['primary', 'primary_link', 'secondary', 'secondary_link']
                
                if d <= 300:
                    base_traffic = int(reg_daily * (0.50 if is_high_tier else 0.32) * (1.0 - (d / 480.0)))
                    is_prime = True
                elif d <= 650:
                    base_traffic = int(reg_daily * (0.28 if is_high_tier else 0.18) * (1.0 - (d / 800.0)))
                    is_prime = (d <= 400 and is_high_tier)
                else:
                    base_traffic = int(reg_daily * (0.14 if is_high_tier else 0.08))
                    is_prime = False

                base_traffic = max(600, base_traffic)

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
                        "length_m": float(round(float(row.get('length', 50)), 1)),
                        "daily_footfall": int(base_traffic),
                        "peak_hourly_footfall": int(max(hourly)),
                        "hourly_footfall": hourly,
                        "is_prime_corridor": bool(is_prime),
                        "dist_to_store_m": float(round(d, 1))
                    },
                    "geometry": mapping(line_geo)
                }
                all_features.append(feat)
                store_edge_count += 1

            print(f"   ✓ Extracted {store_edge_count} real street segments for {loc}.\n")

        except Exception as e:
            print(f"   ❌ Error extracting for {loc}: {e}\n")

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
    print(f"🎉 COMPLETED: Extracted {len(all_features)} REAL OSM street segments across ALL {len(stores)} Apsara locations!")
    print(f"🎉 COMPLETED: Generated {len(catchment_features)} catchment zone polygons!")
    print(f"===========================================================\n")

if __name__ == "__main__":
    run_extraction()
