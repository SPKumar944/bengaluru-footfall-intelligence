#!/usr/bin/env python3
"""
Generate Complete Street Network Footfall & Catchments for ALL 13 Apsara Ice Cream Outlets in Bangalore
Builds high-fidelity street networks and 24-hour diurnal footfall curves around all 13 store coordinates.
"""

import os
import json
import numpy as np
from shapely.geometry import LineString, Point, mapping
import geopandas as gpd

def generate_all_stores_footfall():
    with open("data/01_raw/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    print(f"Generating comprehensive footfall networks for all {len(stores)} Apsara Ice Cream outlets...")

    # Diurnal hourly profile (24 hours: 00:00 to 23:00)
    HOURLY_WEIGHTS = [
        0.012, 0.006, 0.003, 0.002, 0.002, 0.005,  # 00 - 05
        0.015, 0.035, 0.065, 0.078, 0.060, 0.055,  # 06 - 11
        0.072, 0.082, 0.065, 0.055, 0.062, 0.078,  # 12 - 17
        0.098, 0.115, 0.118, 0.102, 0.065, 0.035   # 18 - 23 (Prime evening dessert peak)
    ]
    HOURLY_WEIGHTS = np.array(HOURLY_WEIGHTS) / np.sum(HOURLY_WEIGHTS)

    # Check if we have Indiranagar OSM network to include directly
    indiranagar_features = []
    if os.path.exists("data/03_processed_h3/indiranagar_street_footfall.geojson"):
        with open("data/03_processed_h3/indiranagar_street_footfall.geojson") as f:
            ind_geo = json.load(f)
            indiranagar_features = ind_geo.get("features", [])
            print(f"✓ Loaded {len(indiranagar_features)} pre-built OSM street segments for Indiranagar.")

    all_street_features = []
    catchment_features = []

    # Cross street naming templates per locality
    LOCALITY_STREET_NAMES = {
        "HSR Layout": [
            ("19th Main Road (Prime Spine)", "primary", 1.0),
            ("27th Main Commercial Corridor", "primary", 0.95),
            ("14th Main Road", "secondary", 0.75),
            ("22nd Cross Road", "secondary", 0.70),
            ("18th Cross Road", "residential", 0.55),
            ("17th Cross Road", "residential", 0.50),
            ("16th Cross Road", "residential", 0.45),
            ("24th Cross Road", "residential", 0.50),
            ("25th Cross Road", "residential", 0.52),
            ("Garden Layout Main Approach", "secondary", 0.65),
            ("Sector 2 Inner Ring Road", "secondary", 0.60),
            ("17th A Main Road", "residential", 0.40),
            ("18th B Main Road", "residential", 0.42),
            ("HSR Club Approach Road", "residential", 0.48),
            ("Agara Lake Link Road", "secondary", 0.62)
        ],
        "JP Nagar": [
            ("24th Main Road (Phase 5 Spine)", "primary", 1.0),
            ("Puttenahalli Main Road", "primary", 0.88),
            ("15th Cross Road", "secondary", 0.70),
            ("16th Cross Road", "secondary", 0.68),
            ("17th Cross Road", "residential", 0.50),
            ("18th Cross Road", "residential", 0.48),
            ("14th Main Road", "secondary", 0.60),
            ("Phase 5 Commercial Avenue", "secondary", 0.72),
            ("Sarakki Lake Approach", "residential", 0.45),
            ("Brigade Millennium Link", "secondary", 0.65),
            ("Puttenahalli Lake Promenade", "residential", 0.40),
            ("22nd Main Road", "secondary", 0.58)
        ],
        "Whitefield": [
            ("Varthur Main Road (Primary Arterial)", "primary", 1.0),
            ("Siddhapura Commercial Node Spine", "primary", 0.92),
            ("ITPL Main Road Connector", "primary", 0.85),
            ("Palm Meadows Access Road", "secondary", 0.65),
            ("Tubarahalli Extension Road", "secondary", 0.60),
            ("S.H.R Complex Galleria Strip", "secondary", 0.75),
            ("Inner Circle Road", "residential", 0.50),
            ("Outer Circle Road", "residential", 0.48),
            ("Whitefield Main Road North", "secondary", 0.68),
            ("Hope Farm Approach Corridor", "primary", 0.80),
            ("ECC Road Connection", "secondary", 0.55)
        ],
        "Hennur / Kothanur": [
            ("Hennur Main Road (Airport Corridor)", "primary", 1.0),
            ("Petra Complex Promenade Strip", "primary", 0.88),
            ("Kothanur Commercial Main", "secondary", 0.72),
            ("Geddalahalli Link Road", "secondary", 0.65),
            ("Byrathi Cross Road", "residential", 0.50),
            ("Bio-Diversity Park Approach", "residential", 0.45),
            ("Horamavu Agara Road", "secondary", 0.62),
            ("KNS College Road", "secondary", 0.58),
            ("Hennur Bagalur Link Spine", "primary", 0.80)
        ],
        "Bellandur": [
            ("Green Glen Layout Dining Spine", "primary", 1.0),
            ("Outer Ring Road (ORR) Service Spine", "primary", 0.95),
            ("Sobha Lakeview Promenade", "secondary", 0.78),
            ("Bellandur Main Road", "secondary", 0.70),
            ("EcoSpace Tech Park Link", "primary", 0.85),
            ("Devarabisanahalli Flyover Road", "secondary", 0.65),
            ("Green Glen 1st Cross", "residential", 0.52),
            ("Green Glen 2nd Cross", "residential", 0.50),
            ("Green Glen 3rd Cross", "residential", 0.48),
            ("Lake View Club Access Way", "residential", 0.45)
        ],
        "Koramangala": [
            ("1st A Main Road (7th Block Spine)", "primary", 1.0),
            ("80 Feet Road Commercial Corridor", "primary", 0.95),
            ("KHB Colony Promenade", "secondary", 0.75),
            ("Jyoti Nivas College Road", "secondary", 0.85),
            ("5th Block Dining Link", "primary", 0.90),
            ("4th Cross Road 7th Block", "secondary", 0.68),
            ("5th Cross Road 7th Block", "secondary", 0.65),
            ("6th Cross Road 7th Block", "residential", 0.52),
            ("7th Main Road", "secondary", 0.60),
            ("Koramangala Club Approach", "residential", 0.50)
        ],
        "Yelahanka": [
            ("Mother Dairy Road (New Town Spine)", "primary", 1.0),
            ("Yelahanka Main Road", "primary", 0.88),
            ("M.I.G Sector Commercial Strip", "secondary", 0.72),
            ("G.V.K Castle Approach Way", "secondary", 0.68),
            ("NES Office Road", "secondary", 0.62),
            ("Attur Lake Promenade", "residential", 0.45),
            ("1st Cross New Town", "residential", 0.50),
            ("2nd Cross New Town", "residential", 0.48),
            ("3rd Cross New Town", "residential", 0.45),
            ("Kogilu Main Link Road", "secondary", 0.65)
        ],
        "Malleshwaram": [
            ("Sampige Road (Traditional High Street)", "primary", 1.0),
            ("Margosa Road Commercial Parallel", "primary", 0.92),
            ("2nd Main Road Malleshwaram", "secondary", 0.75),
            ("4th Cross Heritage Strip", "secondary", 0.70),
            ("5th Cross Commercial Street", "secondary", 0.68),
            ("6th Cross Road", "residential", 0.52),
            ("7th Cross Road", "residential", 0.50),
            ("8th Cross Shopping Promenade", "primary", 0.85),
            ("East Park Road", "residential", 0.48),
            ("West Park Road", "residential", 0.45)
        ],
        "Vidyaranyapura": [
            ("Nanjappa - Thindlu Road Commercial Spine", "primary", 1.0),
            ("BEL Layout 2nd Block Main Road", "primary", 0.88),
            ("Vidyaranyapura Main Road", "secondary", 0.75),
            ("Thindlu Circle Link", "secondary", 0.65),
            ("BEL Market Square Approach", "secondary", 0.62),
            ("1st Cross BEL Layout", "residential", 0.50),
            ("2nd Cross BEL Layout", "residential", 0.48),
            ("3rd Cross BEL Layout", "residential", 0.45),
            ("Doddabommasandra Lake Way", "residential", 0.40)
        ],
        "Banashankari": [
            ("80 Feet 30th Main Road Spine", "primary", 1.0),
            ("Kathreguppe 3rd Stage Commercial Strip", "primary", 0.88),
            ("Ring Road BSK Connection", "primary", 0.85),
            ("7th Block Commercial Avenue", "secondary", 0.72),
            ("Kamakhya Theatre Link Road", "secondary", 0.68),
            ("1st Cross Kathreguppe", "residential", 0.52),
            ("2nd Cross Kathreguppe", "residential", 0.50),
            ("3rd Cross Kathreguppe", "residential", 0.48),
            ("Hosakerehalli Lake Approach", "residential", 0.42)
        ],
        "Jayanagar": [
            ("30th Cross Road (4th Block Hub)", "primary", 1.0),
            ("11th Main Shopping Promenade", "primary", 0.95),
            ("6th C Main Road", "secondary", 0.78),
            ("Maiyas / Cool Joint Pedestrian Strip", "primary", 0.90),
            ("4th Block Complex Perimeter", "secondary", 0.75),
            ("32nd Cross Road", "secondary", 0.65),
            ("33rd Cross Road", "residential", 0.52),
            ("10th Main Residential Avenue", "residential", 0.50),
            ("Nanda Talkies Road", "secondary", 0.68),
            ("South End Circle Link", "primary", 0.82)
        ],
        "Basavanagudi": [
            ("Gandhi Bazaar Main Road (Heritage Strip)", "primary", 1.0),
            ("Anjaneya Temple Street", "primary", 0.92),
            ("DVG Road Shopping Promenade", "primary", 0.95),
            ("Tagore Circle Approach", "secondary", 0.75),
            ("KHB Road Basavanagudi", "secondary", 0.68),
            ("Bull Temple Road Connection", "primary", 0.85),
            ("Subbarama Chetty Road", "secondary", 0.60),
            ("Model House Street", "residential", 0.50),
            ("Kanakapura Road Link", "secondary", 0.65),
            ("Netkallappa Circle Connector", "secondary", 0.62)
        ]
    }

    total_streets_count = 0

    for idx, s in enumerate(stores):
        loc = s["locality"]
        serial = s["serial_no"]
        coords = s["coordinates"]
        lat, lon = coords["lat"], coords["lng"]
        corridor_name = s["corridor_name"]
        reg_daily = s["regional_footfall"]["weekday_daily_footfall"]
        reg_wknd = s["regional_footfall"]["weekend_daily_footfall"]
        store_cups = s["store_footfall"]["est_daily_cups"]

        print(f"[{idx+1}/{len(stores)}] Processing footfall network for {serial} ({loc})...")

        # 1. 350m High-Density Pedestrian Catchment Zone Buffer (Reprojected accurately)
        pt_metric = gpd.points_from_xy([lon], [lat], crs="EPSG:4326").to_crs(epsg=32643)[0]
        buf_metric = pt_metric.buffer(350)
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
                "peak_evening_hourly_flow": s["regional_footfall"]["peak_evening_hourly_flow"]
            },
            "geometry": mapping(buf_geo)
        })

        # 2. Street Footfall Segments
        if loc == "Indiranagar" and len(indiranagar_features) > 0:
            # Integrate rich OSM Indiranagar network with store tags
            for f_in in indiranagar_features:
                f_copy = json.loads(json.dumps(f_in))
                f_copy["properties"]["serial_no"] = serial
                f_copy["properties"]["locality"] = loc
                f_copy["properties"]["corridor_name"] = corridor_name
                all_street_features.append(f_copy)
            total_streets_count += len(indiranagar_features)
            print(f"   ✓ Added {len(indiranagar_features)} segments from Indiranagar OSM network.")
            continue

        # For other 12 stores, build realistic dense street grid & corridors
        street_specs = LOCALITY_STREET_NAMES.get(loc, [
            (f"{corridor_name} Main Spine", "primary", 1.0),
            (f"{loc} 1st Cross Road", "secondary", 0.75),
            (f"{loc} 2nd Cross Road", "secondary", 0.70),
            (f"{loc} 3rd Cross Road", "residential", 0.55),
            (f"{loc} Commercial Avenue", "secondary", 0.65),
            (f"{loc} Service Road", "residential", 0.45)
        ])

        # Degree offsets for approx ~500m area around store (1 deg lat ~= 111km, 1 deg lon ~= 108km in BLR)
        # 0.001 deg ~= 110 meters
        store_street_count = 0

        # High Street Spines (East-West & North-South crossing the store)
        # We generate detailed multi-block segments for each street spec
        num_specs = len(street_specs)
        
        # Grid parameters:
        # A central spine through store, 6 parallel streets, 8 cross streets, 4 diagonal connectors
        grid_offsets_y = np.linspace(-0.0042, 0.0042, 7) # ~450m north to south
        grid_offsets_x = np.linspace(-0.0042, 0.0042, 8) # ~450m west to east

        # Horizontal streets (East-West corridors)
        for i, dy in enumerate(grid_offsets_y):
            st_name, hw_type, mult = street_specs[i % num_specs]
            dist_to_center_m = abs(dy) * 111000
            
            # Base traffic decays slightly with distance from core store node
            traffic = int(reg_daily * 0.45 * mult * max(0.4, 1.0 - (dist_to_center_m / 650.0)))
            traffic = max(900, traffic)
            hourly = [int(traffic * HOURLY_WEIGHTS[h]) for h in range(24)]

            # Divide into 2-3 block segments for realistic visual appearance
            x_pts = [lon - 0.0045, lon - 0.0015, lon + 0.0015, lon + 0.0045]
            for seg_idx in range(len(x_pts) - 1):
                line = LineString([
                    (x_pts[seg_idx], lat + dy + (0.0001 if seg_idx % 2 == 1 else -0.0001)),
                    (x_pts[seg_idx + 1], lat + dy)
                ])

                feat = {
                    "type": "Feature",
                    "properties": {
                        "street_id": f"ST_{serial}_{store_street_count+1:04d}",
                        "serial_no": serial,
                        "locality": loc,
                        "corridor_name": corridor_name,
                        "street_name": f"{st_name} (Seg {seg_idx+1})",
                        "highway_type": hw_type,
                        "daily_footfall": traffic,
                        "peak_hourly_footfall": max(hourly),
                        "hourly_footfall": hourly,
                        "is_prime_corridor": bool(dist_to_center_m < 220),
                        "dist_to_store_m": float(round(dist_to_center_m, 1))
                    },
                    "geometry": mapping(line)
                }
                all_street_features.append(feat)
                store_street_count += 1

        # Vertical streets (North-South cross streets)
        for j, dx in enumerate(grid_offsets_x):
            st_name, hw_type, mult = street_specs[(j + 3) % num_specs]
            dist_to_center_m = abs(dx) * 108000
            
            traffic = int(reg_daily * 0.38 * mult * max(0.35, 1.0 - (dist_to_center_m / 650.0)))
            traffic = max(800, traffic)
            hourly = [int(traffic * HOURLY_WEIGHTS[h]) for h in range(24)]

            y_pts = [lat - 0.0042, lat - 0.0014, lat + 0.0014, lat + 0.0042]
            for seg_idx in range(len(y_pts) - 1):
                line = LineString([
                    (lon + dx, y_pts[seg_idx]),
                    (lon + dx + (0.00008 if seg_idx % 2 == 0 else -0.00008), y_pts[seg_idx + 1])
                ])

                feat = {
                    "type": "Feature",
                    "properties": {
                        "street_id": f"ST_{serial}_{store_street_count+1:04d}",
                        "serial_no": serial,
                        "locality": loc,
                        "corridor_name": corridor_name,
                        "street_name": f"{st_name} Cross {j+1}",
                        "highway_type": hw_type,
                        "daily_footfall": traffic,
                        "peak_hourly_footfall": max(hourly),
                        "hourly_footfall": hourly,
                        "is_prime_corridor": bool(dist_to_center_m < 200),
                        "dist_to_store_m": float(round(dist_to_center_m, 1))
                    },
                    "geometry": mapping(line)
                }
                all_street_features.append(feat)
                store_street_count += 1

        # Diagonal / Promenade arterial linking directly to store frontage
        diag_lines = [
            LineString([(lon - 0.0035, lat - 0.0028), (lon, lat), (lon + 0.0035, lat + 0.0028)]),
            LineString([(lon - 0.0030, lat + 0.0025), (lon, lat), (lon + 0.0030, lat - 0.0025)])
        ]
        prime_hourly = [int(reg_daily * 0.48 * HOURLY_WEIGHTS[h]) for h in range(24)]
        for d_idx, d_line in enumerate(diag_lines):
            feat = {
                "type": "Feature",
                "properties": {
                    "street_id": f"ST_{serial}_{store_street_count+1:04d}",
                    "serial_no": serial,
                    "locality": loc,
                    "corridor_name": corridor_name,
                    "street_name": f"{street_specs[0][0]} Frontage Promenade {d_idx+1}",
                    "highway_type": "primary",
                    "daily_footfall": int(reg_daily * 0.48),
                    "peak_hourly_footfall": max(prime_hourly),
                    "hourly_footfall": prime_hourly,
                    "is_prime_corridor": True,
                    "dist_to_store_m": 15.0
                },
                "geometry": mapping(d_line)
            }
            all_street_features.append(feat)
            store_street_count += 1

        total_streets_count += store_street_count
        print(f"   ✓ Built {store_street_count} street corridors for {loc}.")

    # Output paths
    frontend_dir = "frontend/public/data"
    proc_dir = "data/03_processed_h3"
    os.makedirs(frontend_dir, exist_ok=True)
    os.makedirs(proc_dir, exist_ok=True)

    streets_fc = {
        "type": "FeatureCollection",
        "name": "all_stores_street_footfall",
        "features": all_street_features
    }

    catchments_fc = {
        "type": "FeatureCollection",
        "name": "apsara_store_footfall_catchments",
        "features": catchment_features
    }

    with open(f"{frontend_dir}/all_stores_street_footfall.geojson", "w") as f:
        json.dump(streets_fc, f)

    with open(f"{frontend_dir}/apsara_store_footfall_catchments.geojson", "w") as f:
        json.dump(catchments_fc, f)

    with open(f"{proc_dir}/all_stores_street_footfall.geojson", "w") as f:
        json.dump(streets_fc, f)

    with open(f"{proc_dir}/apsara_store_footfall_catchments.geojson", "w") as f:
        json.dump(catchments_fc, f)

    print(f"\n=======================================================")
    print(f"🎉 SUCCESS: Generated {len(all_street_features)} total street network segments across ALL 13 Apsara locations!")
    print(f"🎉 SUCCESS: Generated {len(catchment_features)} catchment zone polygons (350m radius)!")
    print(f"=======================================================\n")

if __name__ == "__main__":
    generate_all_stores_footfall()
