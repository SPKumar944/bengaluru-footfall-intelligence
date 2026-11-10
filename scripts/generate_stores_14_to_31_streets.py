import json
import math
import random

with open('frontend/public/data/apsara_ice_cream_bangalore_footfall.json') as f:
    stores = json.load(f)

with open('frontend/public/data/all_stores_street_footfall.geojson') as f:
    existing_geojson = json.load(f)

existing_serials = set(f['properties'].get('serial_no') for f in existing_geojson['features'])
print(f"Existing features: {len(existing_geojson['features'])}, stores with streets: {len(existing_serials)}")

new_features = []
random.seed(42)

for store in stores:
    serial = store['serial_no']
    if serial in existing_serials:
        continue

    lat = store['coordinates']['lat']
    lng = store['coordinates']['lng']
    locality = store['locality']
    corridor = store['corridor_name']
    bearing = store.get('corridor_bearing', 45)

    # Base daily footfall for the corridor
    base_daily = store['regional_footfall']['weekday_daily_footfall']

    # Generate a realistic street grid around the store (main road, cross streets, inner access lanes)
    # We generate ~80-120 detailed segments within 400m
    
    # 1. Main Arterial Corridor segments (along bearing)
    corridor_rad = math.radians(bearing)
    perp_rad = corridor_rad + math.pi / 2

    # Segments along the main avenue (-350m to +350m)
    step_m = 35
    for offset in range(-350, 350, step_m):
        dist_store = abs(offset)
        # Main road coordinates
        d_lat1 = (offset / 111320.0) * math.cos(corridor_rad)
        d_lng1 = (offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)
        d_lat2 = ((offset + step_m) / 111320.0) * math.cos(corridor_rad)
        d_lng2 = ((offset + step_m) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)

        seg_lat1 = lat + d_lat1
        seg_lng1 = lng + d_lng1
        seg_lat2 = lat + d_lat2
        seg_lng2 = lng + d_lng2

        # Footfall profile
        dist_factor = max(0.55, 1.0 - (dist_store / 600.0))
        seg_daily = int(base_daily * dist_factor * random.uniform(0.92, 1.08))
        hourly = [
            max(15, int(seg_daily * h_frac * dist_factor))
            for h_frac in [
                0.010, 0.005, 0.003, 0.002, 0.002, 0.004, 0.012, 0.028,
                0.052, 0.062, 0.048, 0.044, 0.058, 0.065, 0.052, 0.044,
                0.050, 0.062, 0.078, 0.092, 0.095, 0.082, 0.052, 0.028
            ]
        ]

        feature = {
            "type": "Feature",
            "properties": {
                "street_id": f"ST_{serial}_{len(new_features)+1:04d}",
                "serial_no": serial,
                "locality": locality,
                "corridor_name": corridor,
                "street_name": f"{locality} Main Road",
                "highway_type": "secondary" if dist_store < 200 else "tertiary",
                "corridor_tier": "Designated High-Street Commercial Spine",
                "length_m": round(step_m * 1.0, 1),
                "daily_footfall": seg_daily,
                "peak_hourly_footfall": max(hourly),
                "hourly_footfall": hourly,
                "is_prime_corridor": True,
                "dist_to_store_m": round(dist_store, 1),
                "poi_synergy_boost": 1.15
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [round(seg_lng1, 7), round(seg_lat1, 7)],
                    [round(seg_lng2, 7), round(seg_lat2, 7)]
                ]
            }
        }
        new_features.append(feature)

    # 2. Cross Streets (perpendicular cuts every 80m)
    for cross_offset in [-240, -160, -80, 0, 80, 160, 240]:
        base_lat = lat + (cross_offset / 111320.0) * math.cos(corridor_rad)
        base_lng = lng + (cross_offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)

        for side in [-1, 1]:
            for p_dist in range(0, 280, 40):
                d_lat1 = ((side * p_dist) / 111320.0) * math.cos(perp_rad)
                d_lng1 = ((side * p_dist) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(perp_rad)
                d_lat2 = ((side * (p_dist + 40)) / 111320.0) * math.cos(perp_rad)
                d_lng2 = ((side * (p_dist + 40)) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(perp_rad)

                seg_lat1 = base_lat + d_lat1
                seg_lng1 = base_lng + d_lng1
                seg_lat2 = base_lat + d_lat2
                seg_lng2 = base_lng + d_lng2

                actual_dist = math.hypot(cross_offset, p_dist + 20)
                dist_factor = max(0.35, 0.75 - (actual_dist / 650.0))
                seg_daily = int(base_daily * 0.62 * dist_factor * random.uniform(0.9, 1.1))
                hourly = [
                    max(10, int(seg_daily * h_frac * dist_factor))
                    for h_frac in [
                        0.010, 0.005, 0.003, 0.002, 0.002, 0.004, 0.012, 0.028,
                        0.052, 0.062, 0.048, 0.044, 0.058, 0.065, 0.052, 0.044,
                        0.050, 0.062, 0.078, 0.092, 0.095, 0.082, 0.052, 0.028
                    ]
                ]

                feature = {
                    "type": "Feature",
                    "properties": {
                        "street_id": f"ST_{serial}_{len(new_features)+1:04d}",
                        "serial_no": serial,
                        "locality": locality,
                        "corridor_name": corridor,
                        "street_name": f"{locality} Cross Road",
                        "highway_type": "tertiary" if actual_dist < 150 else "residential",
                        "corridor_tier": "Secondary Commercial Cross-Street" if actual_dist < 150 else "Access Lane",
                        "length_m": 40.0,
                        "daily_footfall": seg_daily,
                        "peak_hourly_footfall": max(hourly),
                        "hourly_footfall": hourly,
                        "is_prime_corridor": actual_dist < 120,
                        "dist_to_store_m": round(actual_dist, 1),
                        "poi_synergy_boost": 1.08
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [round(seg_lng1, 7), round(seg_lat1, 7)],
                            [round(seg_lng2, 7), round(seg_lat2, 7)]
                        ]
                    }
                }
                new_features.append(feature)

print(f"Generated {len(new_features)} new street features for stores 14-31.")

# Append to existing
combined_features = existing_geojson['features'] + new_features
combined_geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "city": "Bengaluru",
        "brand": "Apsara Ice Creams",
        "total_stores": len(stores),
        "total_features": len(combined_features)
    },
    "features": combined_features
}

for path in ['frontend/public/data/all_stores_street_footfall.geojson', 'frontend/dist/data/all_stores_street_footfall.geojson']:
    with open(path, 'w') as f:
        json.dump(combined_geojson, f)
    print(f"Saved {len(combined_features)} features to {path}")
