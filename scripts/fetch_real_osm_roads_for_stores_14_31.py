#!/usr/bin/env python3
"""
Fetch real OpenStreetMap road vectors for Apsara Ice Cream stores 14 to 31.
Queries Overpass API for real curving road geometry (out geom) within 480m radius.
Saves raw responses to cache/osm_stores_raw/{serial_no}.json.
"""

import os
import json
import time
import urllib.request
import urllib.parse

CACHE_DIR = "cache/osm_stores_raw"
os.makedirs(CACHE_DIR, exist_ok=True)

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]

def fetch_store_osm(serial, lat, lng, store_name, locality):
    out_file = os.path.join(CACHE_DIR, f"{serial}.json")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        with open(out_file) as f:
            d = json.load(f)
            ways = [e for e in d.get("elements", []) if e.get("type") == "way"]
            if len(ways) >= 10:
                print(f"[{serial}] Cached: {len(ways)} ways found for {store_name} ({locality})")
                return d

    query = f"""[out:json][timeout:35];
(
  way["highway"~"primary|secondary|tertiary|residential|service|unclassified|living_street|pedestrian|trunk"](around:480, {lat}, {lng});
);
out geom;
"""
    data = urllib.parse.urlencode({"data": query.strip()}).encode("utf-8")
    headers = {"User-Agent": "ApsaraIceCreamFootfallAudit/2.0 (urban_kinematics@apsara.internal)"}

    for attempt in range(4):
        ep = ENDPOINTS[attempt % len(ENDPOINTS)]
        try:
            print(f"[{serial}] Querying {ep} for {store_name} ({locality}) [att {attempt+1}]...")
            req = urllib.request.Request(ep, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                res_bytes = resp.read()
                res = json.loads(res_bytes.decode("utf-8"))
                ways = [e for e in res.get("elements", []) if e.get("type") == "way"]
                print(f"[{serial}] SUCCESS: {len(ways)} real OSM ways fetched!")
                with open(out_file, "w") as f_out:
                    f_out.write(res_bytes.decode("utf-8"))
                time.sleep(1.5)
                return res
        except Exception as e:
            print(f"[{serial}] Error on {ep}: {e}")
            time.sleep(3.0 * (attempt + 1))

    # Fallback to local cache files in cache/ if Overpass is down
    print(f"[{serial}] Falling back to local cache inspection...")
    return None

def main():
    with open("frontend/public/data/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    target_stores = [
        s for s in stores
        if int(s["serial_no"].split("_")[-1]) >= 14
    ]

    print(f"Starting fetch for {len(target_stores)} stores (14 to 31)...")
    for s in target_stores:
        serial = s["serial_no"]
        lat = s["coordinates"]["lat"]
        lng = s["coordinates"]["lng"]
        fetch_store_osm(serial, lat, lng, s["store_name"], s["locality"])

if __name__ == "__main__":
    main()
