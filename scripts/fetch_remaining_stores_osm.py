#!/usr/bin/env python3
"""
Fetch remaining OSM data for stores 16, 17, 18, 19, 20, 21, 23, 24, 27, 31
using official OpenStreetMap API (api.openstreetmap.org).
Saves converted ways directly to cache/osm_stores_raw/{serial}.json.
"""

import os
import json
import time
import urllib.request
import xml.etree.ElementTree as ET

CACHE_DIR = "cache/osm_stores_raw"
os.makedirs(CACHE_DIR, exist_ok=True)

RELEVANT_HIGHWAYS = {
    'primary', 'primary_link', 'secondary', 'secondary_link',
    'tertiary', 'tertiary_link', 'residential', 'living_street',
    'service', 'unclassified', 'trunk', 'trunk_link', 'pedestrian'
}

def fetch_osm_for_store(serial, lat, lng, store_name, locality):
    out_file = os.path.join(CACHE_DIR, f"{serial}.json")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        print(f"[{serial}] Already cached: {out_file}")
        return

    # 450m bounding box
    d_lat = 450.0 / 111320.0
    d_lng = 450.0 / (111320.0 * 0.9745)
    s, w, n, e = lat - d_lat, lng - d_lng, lat + d_lat, lng + d_lng

    url = f"https://api.openstreetmap.org/api/0.6/map?bbox={w:.5f},{s:.5f},{e:.5f},{n:.5f}"
    headers = {
        "User-Agent": "ApsaraBengaluruRetailIntelligence/2.0 (osm_fetch@apsara.internal)"
    }

    print(f"[{serial}] Fetching {store_name} ({locality}) from api.openstreetmap.org...")
    req = urllib.request.Request(url, headers=headers)

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                xml_data = resp.read()

            root = ET.fromstring(xml_data)
            nodes = {}
            for node in root.findall('node'):
                nodes[node.get('id')] = {
                    'lat': float(node.get('lat')),
                    'lon': float(node.get('lon'))
                }

            ways = []
            for wy in root.findall('way'):
                tags = {t.get('k'): t.get('v') for t in wy.findall('tag')}
                hw = tags.get('highway')
                if hw in RELEVANT_HIGHWAYS:
                    nds = [nodes[nd.get('ref')] for nd in wy.findall('nd') if nd.get('ref') in nodes]
                    if len(nds) >= 2:
                        ways.append({
                            'type': 'way',
                            'id': int(wy.get('id')),
                            'nodes': [int(nd.get('ref')) for nd in wy.findall('nd') if nd.get('ref') in nodes],
                            'tags': tags,
                            'geometry': nds
                        })

            print(f"[{serial}] SUCCESS: {len(ways)} real OSM highway ways extracted (from {len(nodes)} nodes)!")

            result = {
                'version': 0.6,
                'generator': 'api.openstreetmap.org',
                'elements': ways
            }

            with open(out_file, 'w') as f_out:
                json.dump(result, f_out)

            time.sleep(1.2)
            return
        except Exception as err:
            print(f"[{serial}] Error on attempt {attempt+1}: {err}")
            time.sleep(2.0 * (attempt + 1))

def main():
    with open("frontend/public/data/apsara_ice_cream_bangalore_footfall.json") as f:
        stores = json.load(f)

    target_stores = [
        s for s in stores
        if int(s["serial_no"].split("_")[-1]) >= 14
    ]

    for s in target_stores:
        serial = s["serial_no"]
        lat = s["coordinates"]["lat"]
        lng = s["coordinates"]["lng"]
        fetch_osm_for_store(serial, lat, lng, s["store_name"], s["locality"])

if __name__ == "__main__":
    main()
