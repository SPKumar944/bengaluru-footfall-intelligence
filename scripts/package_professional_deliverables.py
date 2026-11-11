#!/usr/bin/env python3
"""
Package all project assets into an impeccably structured, professional deliverable folder.
Structures:
- 01_Executive_Reports_and_Documentation
- 02_Master_Datasets_and_Layers
- 03_Store_Wise_Data_and_Catchments (Individual folders for all 31 stores)
- 04_Raw_Source_Data
- 05_Pipelines_and_Analytics_Scripts
- 06_Interactive_Web_Dashboard_Distribution
"""

import os
import shutil
import json
import csv

BASE_DIR = "staged_deliverables/Bengaluru_Apsara_Retail_Footfall_Intelligence"

def setup_directories():
    subdirs = [
        "01_Executive_Reports_and_Documentation",
        "02_Master_Datasets_and_Layers",
        "03_Store_Wise_Data_and_Catchments",
        "04_Raw_Source_Data",
        "05_Pipelines_and_Analytics_Scripts",
        "06_Interactive_Web_Dashboard_Distribution"
    ]
    for d in subdirs:
        os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)
    print("Base deliverable directories created.")

def package_master_datasets():
    print("Copying master datasets...")
    src_data = "frontend/public/data"
    dest_data = os.path.join(BASE_DIR, "02_Master_Datasets_and_Layers")

    master_files = [
        "all_stores_street_footfall.geojson",
        "apsara_store_footfall_catchments.geojson",
        "apsara_ice_cream_bangalore_footfall.json",
        "layer5_competitors.geojson",
        "layer6_complementary_brands.geojson",
        "education_youth_pois.geojson",
        "kids_family_attractions.geojson",
        "mapped_tech_parks.geojson",
        "office_floor_parts.geojson",
        "wards_demographics.geojson",
        "hexagon_demographics.json",
        "blr_h3_market_grid.json",
        "regional_hourly_footfall_matrix.json",
        "layer1_2_3_grid_1km.geojson",
        "layer4_mobility_150m.geojson",
        "top5_hotspot_catchments.geojson"
    ]

    for fname in master_files:
        src = os.path.join(src_data, fname)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dest_data, fname))
            print(f"  ✓ Copied master: {fname}")

def package_store_wise_data():
    print("Generating store-wise packages for all 31 locations...")
    with open("frontend/public/data/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    with open("frontend/public/data/all_stores_street_footfall.geojson") as f:
        streets_fc = json.load(f)

    with open("frontend/public/data/apsara_store_footfall_catchments.geojson") as f:
        catchments_fc = json.load(f)

    dest_root = os.path.join(BASE_DIR, "03_Store_Wise_Data_and_Catchments")
    if os.path.exists(dest_root):
        shutil.rmtree(dest_root)
    os.makedirs(dest_root, exist_ok=True)

    # Group streets and catchments by serial_no
    streets_by_store = {}
    for ftr in streets_fc.get("features", []):
        sn = ftr["properties"].get("serial_no")
        if sn:
            streets_by_store.setdefault(sn, []).append(ftr)

    catchments_by_store = {}
    for ftr in catchments_fc.get("features", []):
        sn = ftr["properties"].get("serial_no") or ftr["properties"].get("store_id")
        if sn:
            catchments_by_store[sn] = ftr

    csv_rows = []

    for s in stores:
        sn = s["serial_no"]
        loc = s["locality"].replace(" ", "_").replace("/", "-")
        store_dir_name = f"{sn}_{loc}"
        store_path = os.path.join(dest_root, store_dir_name)
        os.makedirs(store_path, exist_ok=True)

        # 1. Store profile json
        with open(os.path.join(store_path, "store_profile.json"), "w") as f_out:
            json.dump(s, f_out, indent=2)

        # 2. Store specific street network
        store_streets = streets_by_store.get(sn, [])
        store_streets_fc = {
            "type": "FeatureCollection",
            "metadata": {
                "serial_no": sn,
                "store_name": s["store_name"],
                "locality": s["locality"],
                "feature_count": len(store_streets)
            },
            "features": store_streets
        }
        with open(os.path.join(store_path, "osm_street_network.geojson"), "w") as f_out:
            json.dump(store_streets_fc, f_out, indent=2)

        # 3. Store catchment
        catchment_ftr = catchments_by_store.get(sn)
        if catchment_ftr:
            catchment_fc = {
                "type": "FeatureCollection",
                "features": [catchment_ftr]
            }
            with open(os.path.join(store_path, "pedestrian_catchment_350m.geojson"), "w") as f_out:
                json.dump(catchment_fc, f_out, indent=2)

        # 4. Copy raw OSM cache if available
        raw_json = os.path.join("cache/osm_stores_raw", f"{sn}.json")
        if os.path.exists(raw_json):
            shutil.copy2(raw_json, os.path.join(store_path, "raw_osm_ways_source.json"))

        graphml = os.path.join("cache/osm_graphs", f"{sn}.graphml")
        if os.path.exists(graphml):
            shutil.copy2(graphml, os.path.join(store_path, "osm_network_graph.graphml"))

        # For directory CSV
        csv_rows.append({
            "Serial No": sn,
            "Store Name": s["store_name"],
            "Locality": s["locality"],
            "Corridor / Commercial Spine": s["corridor_name"],
            "Zone": s["zone"],
            "Latitude": s["coordinates"]["lat"],
            "Longitude": s["coordinates"]["lng"],
            "Google Rating": s["google_rating"],
            "Review Count": s["google_review_count"],
            "Monthly Customers": s["store_footfall"]["est_monthly_customers"],
            "Daily Cups": s["store_footfall"]["est_daily_cups"],
            "Peak Evening Cups": s["store_footfall"]["est_evening_peak_cups"],
            "Avg Ticket (INR)": s["store_footfall"]["avg_ticket_size_inr"],
            "Corridor Weekday Flow": s["regional_footfall"]["weekday_daily_footfall"],
            "Corridor Weekend Flow": s["regional_footfall"]["weekend_daily_footfall"],
            "Weekend Surge %": s["regional_footfall"]["weekend_surge_pct"],
            "Peak Evening Flow / Hr": s["regional_footfall"]["peak_evening_hourly_flow"],
            "Street Network Vectors": len(store_streets)
        })

    # Save Store Directory CSV
    old_csv = os.path.join(BASE_DIR, "01_Executive_Reports_and_Documentation", "STORE_DIRECTORY_31_LOCATIONS.csv")
    if os.path.exists(old_csv):
        os.remove(old_csv)

    csv_path = os.path.join(BASE_DIR, "01_Executive_Reports_and_Documentation", "STORE_DIRECTORY_13_LOCATIONS.csv")
    with open(csv_path, "w", newline="") as f_csv:
        writer = csv.DictWriter(f_csv, fieldnames=list(csv_rows[0].keys()))
        writer.writeheader()
        writer.writerows(csv_rows)
    print(f"Saved: {csv_path} ({len(csv_rows)} stores)")

def package_executive_reports():
    print("Copying executive reports & Excel models...")
    dest = os.path.join(BASE_DIR, "01_Executive_Reports_and_Documentation")

    excel_file = "reports/Apsara_Ice_Cream_Store_Location_Factors.xlsx"
    if os.path.exists(excel_file):
        shutil.copy2(excel_file, os.path.join(dest, "Apsara_Ice_Cream_Store_Location_Factors.xlsx"))
        print(f"  ✓ Copied: {excel_file}")

    # Dataset catalogue
    cat_path = os.path.join(dest, "DATASET_CATALOGUE.csv")
    datasets = [
        {"Dataset Name": "all_stores_street_footfall.geojson", "Type": "Vector GeoJSON (LineString)", "Features": "47,980", "Description": "Authentic OSM street networks for 13 core stores with 24-hr diurnal footfall curves and highway tiers.", "CRS": "EPSG:4326"},
        {"Dataset Name": "apsara_store_footfall_catchments.geojson", "Type": "Vector GeoJSON (Polygon)", "Features": "13", "Description": "Calibrated 350m pedestrian walkshed circular catchment buffers centered on each core outlet.", "CRS": "EPSG:4326"},
        {"Dataset Name": "apsara_ice_cream_bangalore_footfall.json", "Type": "Structured JSON", "Features": "13", "Description": "Master store directory with operating hours, ticket size, regional corridor footfall, and Google Place metadata.", "CRS": "WGS84 Lat/Lng"},
        {"Dataset Name": "layer5_competitors.geojson", "Type": "Vector GeoJSON (Point)", "Features": "48+", "Description": "Direct competitor ice cream parlors (Naturals, Corner House, Polar Bear, Baskin Robbins, Milano, Haagen-Dazs).", "CRS": "EPSG:4326"},
        {"Dataset Name": "layer6_complementary_brands.geojson", "Type": "Vector GeoJSON (Point)", "Features": "120+", "Description": "Footfall magnet synergy brands (McDonald's, KFC, Burger King, Starbucks, Third Wave Coffee, Glen's, Domino's).", "CRS": "EPSG:4326"},
        {"Dataset Name": "education_youth_pois.geojson", "Type": "Vector GeoJSON (Point)", "Features": "85+", "Description": "Educational institutions, universities (Christ, RVCE, BMS), premier K-12 schools, and coaching clusters.", "CRS": "EPSG:4326"},
        {"Dataset Name": "kids_family_attractions.geojson", "Type": "Vector GeoJSON (Point)", "Features": "65+", "Description": "Family leisure anchors (Hamleys, FirstCry, Timezone, cinema multiplexes, public parks & lakes).", "CRS": "EPSG:4326"},
        {"Dataset Name": "mapped_tech_parks.geojson", "Type": "Vector GeoJSON (Polygon/Point)", "Features": "24", "Description": "Major Grade-A IT SEZ campuses (Manyata, Ecospace, RMZ Infinity, Bagmane, Prestige Tech Park).", "CRS": "EPSG:4326"},
        {"Dataset Name": "office_floor_parts.geojson", "Type": "Vector GeoJSON (Polygon)", "Features": "1,450+", "Description": "Commercial building office footprints and floor partitions representing corporate workplace density.", "CRS": "EPSG:4326"},
        {"Dataset Name": "wards_demographics.geojson", "Type": "Vector GeoJSON (Polygon)", "Features": "198", "Description": "BBMP administrative ward boundaries with population counts, age brackets, and literacy demographics.", "CRS": "EPSG:4326"},
        {"Dataset Name": "hexagon_demographics.json", "Type": "H3 Spatial Grid JSON", "Features": "2,800+", "Description": "Uber H3 resolution-8 spatial grid capturing fine-grained population and mobility density across Bengaluru.", "CRS": "H3 Index"}
    ]
    with open(cat_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(datasets[0].keys()))
        w.writeheader()
        w.writerows(datasets)
    print(f"Saved: {cat_path}")

def package_raw_and_scripts():
    print("Packaging raw data and pipelines...")
    dest_raw = os.path.join(BASE_DIR, "04_Raw_Source_Data")
    dest_scripts = os.path.join(BASE_DIR, "05_Pipelines_and_Analytics_Scripts")

    # Raw cache
    raw_osm_dir = os.path.join(dest_raw, "osm_raw_stores")
    os.makedirs(raw_osm_dir, exist_ok=True)
    if os.path.exists("cache/osm_stores_raw"):
        for f in os.listdir("cache/osm_stores_raw"):
            if f.endswith(".json"):
                shutil.copy2(os.path.join("cache/osm_stores_raw", f), os.path.join(raw_osm_dir, f))

    if os.path.exists("data/01_raw/gmaps_indiranagar_scraped.json"):
        shutil.copy2("data/01_raw/gmaps_indiranagar_scraped.json", os.path.join(dest_raw, "gmaps_indiranagar_scraped.json"))
    if os.path.exists("scripts/scraped_blr_stores.json"):
        shutil.copy2("scripts/scraped_blr_stores.json", os.path.join(dest_raw, "scraped_blr_stores.json"))

    # Scripts
    script_files = [
        "scripts/build_full_authentic_osm_streets.py",
        "scripts/fetch_real_osm_roads_for_stores_14_31.py",
        "scripts/fetch_remaining_stores_osm.py",
        "scripts/calibrate_pedestrian_footfall.py",
        "scripts/build_education_youth_pois.py",
        "scripts/build_comprehensive_complementary_brands.py",
        "scripts/generate_store_factors_excel.py"
    ]
    for s in script_files:
        if os.path.exists(s):
            shutil.copy2(s, os.path.join(dest_scripts, os.path.basename(s)))

def package_web_dashboard():
    print("Packaging web dashboard distribution...")
    dest_dist = os.path.join(BASE_DIR, "06_Interactive_Web_Dashboard_Distribution")
    if os.path.exists("frontend/dist"):
        # Copy dist contents, excluding .git
        shutil.copytree("frontend/dist", dest_dist, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git', '.git*'))
        print("  ✓ Web dashboard distribution copied.")

def main():
    setup_directories()
    package_master_datasets()
    package_store_wise_data()
    package_executive_reports()
    package_raw_and_scripts()
    package_web_dashboard()
    print("\nAll deliverables staged successfully!")

if __name__ == "__main__":
    main()
