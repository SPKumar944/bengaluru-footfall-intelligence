#!/usr/bin/env python3
"""
Calibrates pedestrian footfall datasets for Bengaluru retail intelligence.
Reduces inflated footstep/vehicle counts down to realistic pedestrian kinematics:
- Prime high street commercial corridors (100ft Rd, 80ft Rd, Brigade Rd, Church St):
  Peak Saturday evening pedestrian flow: 1,600 – 2,400 / hr; daily: 14,000 – 22,000 / day.
- Active secondary commercial roads (CMH Rd, 12th Main, Jayanagar 4th Block):
  Peak: 600 – 1,200 / hr; daily: 6,000 – 12,000 / day.
- Moderate neighborhood commercial:
  Peak: 250 – 600 / hr; daily: 2,500 – 6,000 / day.
- Quiet residential / access lanes:
  Peak: 40 – 180 / hr; daily: 500 – 2,000 / day.

Also scales 350m pedestrian walksheds around Apsara stores to realistic 12,000 – 19,000 / day.
"""

import json
import os

def calibrate_streets():
    print("Calibrating all_stores_street_footfall.geojson...")
    path = "frontend/public/data/all_stores_street_footfall.geojson"
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    with open(path, "r") as f:
        data = json.load(f)

    # Scaling factor for raw street hourly footfall
    # Target: max hourly around 1,800 - 2,000 (before weekend mult of 1.2x)
    SCALE_FACTOR = 0.38

    for ftr in data["features"]:
        p = ftr["properties"]
        
        # Scale hourly footfall profile (24 values)
        if "hourly_footfall" in p and isinstance(p["hourly_footfall"], list):
            p["hourly_footfall"] = [
                max(15, round(val * SCALE_FACTOR))
                for val in p["hourly_footfall"]
            ]
        
        # Scale daily footfall
        if "daily_footfall" in p and isinstance(p["daily_footfall"], (int, float)):
            # Cap maximum arterial road at ~22,000 pedestrian flow
            calibrated_daily = round(p["daily_footfall"] * SCALE_FACTOR)
            p["daily_footfall"] = min(24000, max(600, calibrated_daily))

    # Also save to dist if it exists
    with open(path, "w") as f:
        json.dump(data, f)
    print(f"Saved calibrated {path}")

    dist_path = "frontend/dist/data/all_stores_street_footfall.geojson"
    if os.path.exists(dist_path):
        with open(dist_path, "w") as f:
            json.dump(data, f)
        print(f"Saved calibrated {dist_path}")

def calibrate_indiranagar():
    print("Calibrating indiranagar_street_footfall.geojson...")
    path = "frontend/public/data/indiranagar_street_footfall.geojson"
    if not os.path.exists(path):
        return

    with open(path, "r") as f:
        data = json.load(f)

    SCALE_FACTOR = 0.38
    for ftr in data["features"]:
        p = ftr["properties"]
        if "hourly_footfall" in p and isinstance(p["hourly_footfall"], list):
            p["hourly_footfall"] = [
                max(15, round(val * SCALE_FACTOR))
                for val in p["hourly_footfall"]
            ]
        if "daily_footfall" in p and isinstance(p["daily_footfall"], (int, float)):
            calibrated_daily = round(p["daily_footfall"] * SCALE_FACTOR)
            p["daily_footfall"] = min(24000, max(600, calibrated_daily))

    with open(path, "w") as f:
        json.dump(data, f)
    print(f"Saved calibrated {path}")

    dist_path = "frontend/dist/data/indiranagar_street_footfall.geojson"
    if os.path.exists(dist_path):
        with open(dist_path, "w") as f:
            json.dump(data, f)

def calibrate_catchments():
    print("Calibrating apsara_store_footfall_catchments.geojson...")
    path = "frontend/public/data/apsara_store_footfall_catchments.geojson"
    if not os.path.exists(path):
        return

    with open(path, "r") as f:
        data = json.load(f)

    # Scale 350m catchment from ~70k daily down to realistic ~14k - 19k daily pedestrian walkshed
    CATCHMENT_SCALE = 0.26

    for ftr in data["features"]:
        p = ftr["properties"]
        if "peak_evening_hourly_flow" in p:
            p["peak_evening_hourly_flow"] = round(p["peak_evening_hourly_flow"] * CATCHMENT_SCALE)
        if "weekend_daily_footfall" in p:
            p["weekend_daily_footfall"] = round(p["weekend_daily_footfall"] * CATCHMENT_SCALE)
        if "daily_footfall" in p:
            p["daily_footfall"] = round(p["daily_footfall"] * CATCHMENT_SCALE)

    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved calibrated {path}")

    dist_path = "frontend/dist/data/apsara_store_footfall_catchments.geojson"
    if os.path.exists(dist_path):
        with open(dist_path, "w") as f:
            json.dump(data, f, indent=2)

def calibrate_apsara_stores():
    print("Calibrating apsara_ice_cream_bangalore_footfall.json...")
    path = "frontend/public/data/apsara_ice_cream_bangalore_footfall.json"
    if not os.path.exists(path):
        return

    with open(path, "r") as f:
        stores = json.load(f)

    CATCHMENT_SCALE = 0.26
    for s in stores:
        rf = s.get("regional_footfall", {})
        if "peak_evening_hourly_flow" in rf:
            rf["peak_evening_hourly_flow"] = round(rf["peak_evening_hourly_flow"] * CATCHMENT_SCALE)
        if "weekend_daily_footfall" in rf:
            rf["weekend_daily_footfall"] = round(rf["weekend_daily_footfall"] * CATCHMENT_SCALE)
        if "avg_daily_footfall" in rf:
            rf["avg_daily_footfall"] = round(rf["avg_daily_footfall"] * CATCHMENT_SCALE)
        if "weekday_daily_footfall" in rf:
            rf["weekday_daily_footfall"] = round(rf["weekday_daily_footfall"] * CATCHMENT_SCALE)

    with open(path, "w") as f:
        json.dump(stores, f, indent=2)
    print(f"Saved calibrated {path}")

    dist_path = "frontend/dist/data/apsara_ice_cream_bangalore_footfall.json"
    if os.path.exists(dist_path):
        with open(dist_path, "w") as f:
            json.dump(stores, f, indent=2)

if __name__ == "__main__":
    calibrate_streets()
    calibrate_indiranagar()
    calibrate_catchments()
    calibrate_apsara_stores()
    print("Calibration complete.")
