#!/usr/bin/env python3
"""
Generate Realistic, High-Density, Continuous Street Footfall Across ALL 13 Apsara Outlets
Incorporates:
1. High Regional Baseline: Bangalore urban micro-markets (Indiranagar, Koramangala, HSR, Malleshwaram, etc.)
   maintain vibrant pedestrian density across their entire territory.
2. Verified POI Proximity: 556 POIs (Metro stations, dining, cafés, entertainment, corporate) boost nearby streets.
3. Functional Road Hierarchy with Continuous Variance: No flat identical numbers; every road has organic,
   continuous footfall based on street class, length, connectivity, and commercial density.
4. Smooth Circular Walkshed Extents (No Square Box Cutoffs).
"""

import os
import json
import hashlib
import numpy as np
import geopandas as gpd
from shapely.geometry import mapping, Point
from scipy.spatial import cKDTree
import osmnx as ox

CACHE_DIR = "cache/osm_graphs"

# Calibrated 24-Hour Diurnal Hourly Curve (Peak dessert/dining: 19:00 - 23:00)
HOURLY_WEIGHTS = [
    0.012, 0.006, 0.003, 0.002, 0.002, 0.005,  # 00 - 05
    0.015, 0.035, 0.065, 0.078, 0.060, 0.055,  # 06 - 11
    0.072, 0.082, 0.065, 0.055, 0.062, 0.078,  # 12 - 17
    0.098, 0.115, 0.118, 0.102, 0.065, 0.035   # 18 - 23 (Prime evening peak)
]
HOURLY_WEIGHTS = np.array(HOURLY_WEIGHTS) / np.sum(HOURLY_WEIGHTS)

RELEVANT_HIGHWAYS = [
    'primary', 'primary_link', 'secondary', 'secondary_link',
    'tertiary', 'tertiary_link', 'residential', 'living_street', 'pedestrian', 'unclassified', 'trunk', 'trunk_link'
]

# Designated commercial high-street keywords per micro-market
HIGH_STREET_PATTERNS = {
    "Indiranagar": ["100 feet", "100ft", "12th main", "cmh", "chinmaya mission", "indiranagar club", "metro", "80 feet", "defence colony", "double road"],
    "HSR Layout": ["27th main", "19th main", "14th main", "sector 1", "sector 2", "agara", "hsr club", "5th main", "24th main", "outer ring road"],
    "JP Nagar": ["24th main", "puttenahalli", "15th cross", "16th cross", "sarakki", "brigade millennium", "outer ring road", "phase 5", "sheshadri"],
    "Whitefield": ["varthur", "itpl", "siddhapura", "borewell", "whitefield main", "hope farm", "ecc", "inner circle", "outer circle", "channasandra"],
    "Hennur / Kothanur": ["hennur", "kothanur", "petra", "geddalahalli", "bagalur", "byrathi", "ring road"],
    "Bellandur": ["green glen", "outer ring road", "orr", "ecospace", "devarabisanahalli", "bellandur main", "sobha", "kariyammana"],
    "Koramangala": ["80 feet", "80ft", "1st a main", "100 feet", "5th block", "jyoti nivas", "khb", "koramangala club", "7th block", "intermediate ring"],
    "Yelahanka": ["mother dairy", "yelahanka main", "nes", "attur", "kogilu", "new town", "bhuvaneshwari"],
    "Malleshwaram": ["sampige", "margosa", "8th cross", "4th cross", "5th cross", "11th cross", "malleshwaram circle", "18th cross", "2nd main", "central"],
    "Vidyaranyapura": ["nanjappa", "thindlu", "bel layout", "vidyaranyapura main", "bel market", "doddabommasandra"],
    "Banashankari": ["80 feet", "30th main", "kathreguppe", "kamakhya", "banashankari 3rd", "ring road", "7th block", "hosakerehalli"],
    "Jayanagar": ["30th cross", "11th main", "maiyas", "cool joint", "4th block", "9th main", "south end", "32nd cross", "6th c main", "ashoka pillar"],
    "Basavanagudi": ["gandhi bazaar", "dvg", "d.v.g", "bull temple", "tagore circle", "netkallappa", "anjaneya temple", "subbarama chetty", "national college"]
}

def is_commercial_high_street(street_name, locality):
    s_lower = str(street_name).lower()
    patterns = HIGH_STREET_PATTERNS.get(locality, [])
    for p in patterns:
        if p in s_lower:
            return True
    return False

def get_deterministic_jitter(seed_str):
    # Generates a smooth deterministic multiplier between 0.90 and 1.12
    h = int(hashlib.md5(seed_str.encode()).hexdigest()[:6], 16)
    return 0.90 + (h % 220) / 1000.0

def run_realistic_footfall_generation():
    # 1. Load Stores
    with open("data/01_raw/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    # 2. Load POIs and build spatial index
    gdf_pois = gpd.read_file("data/02_intermediate/synergy_pois.geojson").to_crs(epsg=32643)
    poi_coords = np.array([[p.x, p.y] for p in gdf_pois.geometry])
    poi_tree = cKDTree(poi_coords)
    poi_categories = gdf_pois['category'].tolist()
    poi_weights = gdf_pois['synergy_weight'].tolist()

    print(f"Building realistic, high-density footfall for {len(stores)} Bangalore micro-markets...\n")

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

        print(f"[{idx+1}/{len(stores)}] {serial} — {loc} (Daily regional volume: {reg_daily:,})")

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

        # 2. Load Graph
        cache_path = os.path.join(CACHE_DIR, f"{serial}.graphml")
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
            length_m = float(row.get('length', 50))

            raw_name = row.get('name')
            if isinstance(raw_name, list):
                raw_name = raw_name[0]
            if not raw_name or str(raw_name) == 'nan':
                raw_name = f"{loc} Street"

            hw = row.get('highway', 'residential')
            if isinstance(hw, list):
                hw = hw[0]

            is_high_street = is_commercial_high_street(raw_name, loc)

            # Circular Walkshed Clipping: 1,250m radius (extends to 1,350m for primary corridors)
            max_r = 1350.0 if (is_high_street or hw in ['primary', 'trunk']) else 1250.0
            if d_to_center > max_r:
                continue

            # POI Proximity Boost
            dist_to_poi, poi_idx = poi_tree.query([centroid_m.x, centroid_m.y])
            poi_boost = 1.0
            poi_cat = poi_categories[poi_idx]
            if dist_to_poi <= 250:
                if poi_cat == 'transit_metro':
                    poi_boost = 1.45 - (dist_to_poi / 250.0) * 0.20 # Up to +45% near metro
                elif poi_cat in ['dining_qsr', 'cafe_dessert']:
                    poi_boost = 1.30 - (dist_to_poi / 250.0) * 0.15 # Up to +30% near dining
                elif poi_cat in ['entertainment', 'corporate_tech']:
                    poi_boost = 1.25 - (dist_to_poi / 250.0) * 0.12 # Up to +25% near tech/entertainment
                else:
                    poi_boost = 1.15

            # Deterministic variation so streets have natural, organic variance
            jitter = get_deterministic_jitter(f"{serial}_{raw_name}_{int(centroid_m.x)}")
            # Length weighting: longer avenue segments collect more pedestrian flows
            length_factor = min(1.20, max(0.88, (length_m / 100.0) ** 0.15))

            # Realistic, High-Density Footfall Allocation
            # Micro-markets like Indiranagar/Koramangala/HSR maintain vibrant density everywhere inside the radius
            if is_high_street:
                corridor_count += 1
                base_traffic = int(reg_daily * 0.58 * poi_boost * length_factor * jitter)
                is_prime = True
                tier_label = "Designated High-Street Commercial Spine"
            elif hw in ['primary', 'primary_link', 'trunk', 'trunk_link']:
                base_traffic = int(reg_daily * 0.44 * poi_boost * length_factor * jitter)
                is_prime = True
                tier_label = "Primary Arterial Corridor"
            elif hw in ['secondary', 'secondary_link']:
                base_traffic = int(reg_daily * 0.32 * poi_boost * length_factor * jitter)
                is_prime = (d_to_store <= 400 or poi_boost > 1.2)
                tier_label = "Secondary Commercial Spine"
            elif hw in ['tertiary', 'tertiary_link']:
                base_traffic = int(reg_daily * 0.20 * poi_boost * length_factor * jitter)
                is_prime = (d_to_store <= 250)
                tier_label = "Mixed-Use Collector Avenue"
            else:
                # Active Urban Neighborhood Street
                # Substantial ambient pedestrian flow (residents, deliveries, walkers, parking transit)
                base_traffic = int(reg_daily * 0.10 * poi_boost * length_factor * jitter)
                base_traffic = max(2400, base_traffic)
                is_prime = False
                tier_label = "Neighborhood Street"

            # Diurnal 24-hour curve
            hourly = [int(base_traffic * HOURLY_WEIGHTS[h]) for h in range(24)]

            # Reproject to 4326
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
                    "length_m": float(round(length_m, 1)),
                    "daily_footfall": int(base_traffic),
                    "peak_hourly_footfall": int(max(hourly)),
                    "hourly_footfall": hourly,
                    "is_prime_corridor": bool(is_prime),
                    "dist_to_store_m": float(round(d_to_store, 1)),
                    "poi_synergy_boost": round(poi_boost, 2)
                },
                "geometry": mapping(line_geo)
            }
            all_features.append(feat)
            store_edge_count += 1

        print(f"   ✓ Generated {store_edge_count} high-density road segments ({corridor_count} high-street segments) for {loc}.\n")

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
    print(f"🎉 COMPLETED: High-density, realistic continuous footfall generated for {len(all_features)} segments!")
    print(f"===========================================================\n")

if __name__ == "__main__":
    run_realistic_footfall_generation()
