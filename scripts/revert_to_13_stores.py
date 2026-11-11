#!/usr/bin/env python3
"""
Revert and maintain strictly the original 13 verified Apsara stores in Bengaluru.
Filters:
- apsara_ice_cream_bangalore_footfall.json (13 stores)
- apsara_store_footfall_catchments.geojson (13 catchments)
- all_stores_street_footfall.geojson (47,980 original OSM features for stores 1-13)
"""

import json
import os

DATA_DIRS = ["frontend/public/data", "frontend/dist/data"]

def prune_stores():
    # 1. Stores JSON
    stores_path = "frontend/public/data/apsara_ice_cream_bangalore_footfall.json"
    with open(stores_path) as f:
        stores = json.load(f)
    
    stores_13 = [s for s in stores if int(s["serial_no"].split("_")[-1]) <= 13]
    print(f"Pruned stores from {len(stores)} -> {len(stores_13)}")

    for d in DATA_DIRS:
        p = os.path.join(d, "apsara_ice_cream_bangalore_footfall.json")
        if os.path.exists(os.path.dirname(p)):
            with open(p, "w") as f:
                json.dump(stores_13, f, indent=2)
            print(f"  ✓ Saved {p}")

    # 2. Catchments GeoJSON
    catch_path = "frontend/public/data/apsara_store_footfall_catchments.geojson"
    with open(catch_path) as f:
        catch = json.load(f)
    
    catch_13 = [
        c for c in catch["features"] 
        if int((c["properties"].get("serial_no") or c["properties"].get("store_id")).split("_")[-1]) <= 13
    ]
    catch["features"] = catch_13
    if "metadata" in catch:
        catch["metadata"]["total_stores"] = len(catch_13)

    print(f"Pruned catchments -> {len(catch_13)}")
    for d in DATA_DIRS:
        p = os.path.join(d, "apsara_store_footfall_catchments.geojson")
        if os.path.exists(os.path.dirname(p)):
            with open(p, "w") as f:
                json.dump(catch, f, indent=2)
            print(f"  ✓ Saved {p}")

    # 3. Streets GeoJSON
    streets_path = "frontend/public/data/all_stores_street_footfall.geojson"
    with open(streets_path) as f:
        streets = json.load(f)
    
    streets_13 = [
        s for s in streets["features"]
        if int(s["properties"].get("serial_no", "0").split("_")[-1]) <= 13
    ]
    streets["features"] = streets_13
    if "metadata" in streets:
        streets["metadata"]["total_stores"] = 13
        streets["metadata"]["total_features"] = len(streets_13)

    print(f"Pruned streets from {len(streets.get('features', []))} -> {len(streets_13)}")
    for d in DATA_DIRS:
        p = os.path.join(d, "all_stores_street_footfall.geojson")
        if os.path.exists(os.path.dirname(p)):
            with open(p, "w") as f:
                json.dump(streets, f)
            print(f"  ✓ Saved {p} ({os.path.getsize(p) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    prune_stores()
