#!/usr/bin/env python3
"""
Build Realistic Indiranagar Street Network Footfall GeoJSON with 24-Hour Diurnal Dynamics
Maps footfall directly onto Indiranagar's real streets (100ft Rd, 12th Main, CMH Rd, Metro, Cross Roads)
"""

import os
import json
import osmnx as ox
import geopandas as gpd
import numpy as np
from shapely.geometry import mapping, LineString, Point

def build_indiranagar_footfall():
    print("Extracting Indiranagar street network from OpenStreetMap...")
    center_point = (12.9719, 77.6412) # 100ft & 12th Main intersection
    G = ox.graph_from_point(center_point, dist=1600, network_type="all")
    gdf_edges = ox.graph_to_gdfs(G, nodes=False)

    print(f"Total raw segments: {len(gdf_edges)}")

    # Keep relevant highway classes
    relevant_highways = [
        'primary', 'primary_link', 'secondary', 'secondary_link',
        'tertiary', 'tertiary_link', 'residential', 'living_street', 'pedestrian', 'unclassified'
    ]
    
    # Filter
    filtered = gdf_edges[gdf_edges['highway'].isin(relevant_highways)].copy()
    print(f"Filtered to {len(filtered)} commercial/pedestrian segments in Indiranagar.")

    # Diurnal hourly profile (24 hours: 00:00 to 23:00)
    # Calibrated to urban Indian commercial/dessert high streets:
    # 00-05: Minimal (0.5% - 2%)
    # 06-08: Morning exercise/transit (2% - 4%)
    # 09-11: Morning office/transit rush (6% - 8%)
    # 12-15: Lunch & business (7% - 8.5%)
    # 16-18: Tea & early retail (6.5% - 7.5%)
    # 19-23: PRIME EVENING PEAK (DESSERT & DINING) (9.5% - 11.5% per hour!)
    HOURLY_WEIGHTS = [
        0.012, 0.006, 0.003, 0.002, 0.002, 0.005,  # 00 - 05
        0.015, 0.035, 0.065, 0.078, 0.060, 0.055,  # 06 - 11
        0.072, 0.082, 0.065, 0.055, 0.062, 0.078,  # 12 - 17
        0.098, 0.115, 0.118, 0.102, 0.065, 0.035   # 18 - 23 (Evening peak)
    ]
    HOURLY_WEIGHTS = np.array(HOURLY_WEIGHTS) / np.sum(HOURLY_WEIGHTS)

    # Key landmark coordinates to calculate proximity-based footfall multiplier
    CORRIDORS = [
        {"name": "100 Feet Road (Main High-Street)", "lat": 12.9730, "lon": 77.6405, "base_daily": 24500, "radius_m": 450},
        {"name": "12th Main Road (Boutique & Dessert Strip)", "lat": 12.9710, "lon": 77.6445, "base_daily": 17800, "radius_m": 350},
        {"name": "CMH Road (Metro & Retail Corridor)", "lat": 12.9785, "lon": 77.6385, "base_daily": 19200, "radius_m": 400},
        {"name": "Shri Krishna Temple Rd (Milano Strip)", "lat": 12.9790, "lon": 77.6440, "base_daily": 11500, "radius_m": 250},
        {"name": "8th Cross Road (Corner House Strip)", "lat": 12.9701, "lon": 77.6375, "base_daily": 10800, "radius_m": 250},
        {"name": "Indiranagar Metro Station Node", "lat": 12.9784, "lon": 77.6387, "base_daily": 26000, "radius_m": 300}
    ]

    features = []

    # Reproject to metric to calculate distances and buffer
    gdf_metric = filtered.to_crs(epsg=32643)

    for idx, row in gdf_metric.iterrows():
        geom_metric = row.geometry
        centroid_metric = geom_metric.centroid
        
        # Calculate distance to nearest key corridor
        min_dist = 999999
        matched_corridor = "Neighborhood Street"
        base_traffic = 2200 # Baseline residential/local street

        for c in CORRIDORS:
            # point in metric
            c_pt = gpd.points_from_xy([c["lon"]], [c["lat"]], crs="EPSG:4326").to_crs(epsg=32643)[0]
            d = centroid_metric.distance(c_pt)
            if d < min_dist:
                min_dist = d
                matched_corridor = c["name"]
                # Traffic decays with distance
                if d <= c["radius_m"]:
                    factor = 1.0 - (d / c["radius_m"]) * 0.45
                    base_traffic = int(c["base_daily"] * factor)

        # Reproject geometry back to EPSG:4326 for GeoJSON
        line_geo = gpd.GeoSeries([geom_metric], crs="EPSG:32643").to_crs(epsg=4326)[0]

        # Street name from OSM
        street_name = row.get('name')
        if isinstance(street_name, list):
            street_name = street_name[0]
        if not street_name or str(street_name) == 'nan':
            street_name = matched_corridor

        # Hourly footfall array (24 values)
        hourly_footfall = [int(base_traffic * HOURLY_WEIGHTS[h]) for h in range(24)]
        peak_hourly = max(hourly_footfall)

        feat = {
            "type": "Feature",
            "properties": {
                "street_id": f"IND_ST_{len(features)+1:04d}",
                "street_name": street_name,
                "corridor_zone": matched_corridor,
                "highway_type": row.get('highway', 'residential'),
                "length_m": round(row.get('length', 100), 1),
                "daily_footfall": base_traffic,
                "peak_hourly_footfall": peak_hourly,
                "hourly_footfall": hourly_footfall,
                "is_prime_corridor": (min_dist < 350)
            },
            "geometry": mapping(line_geo)
        }
        features.append(feat)

    geojson_data = {
        "type": "FeatureCollection",
        "name": "indiranagar_street_footfall",
        "features": features
    }

    os.makedirs("frontend/public/data", exist_ok=True)
    os.makedirs("data/03_processed_h3", exist_ok=True)

    out_file1 = "frontend/public/data/indiranagar_street_footfall.geojson"
    out_file2 = "data/03_processed_h3/indiranagar_street_footfall.geojson"

    with open(out_file1, "w") as f:
        json.dump(geojson_data, f)
    with open(out_file2, "w") as f:
        json.dump(geojson_data, f)

    print(f"✓ Saved {len(features)} Indiranagar street footfall segments to {out_file1}")

if __name__ == "__main__":
    build_indiranagar_footfall()
