import json
import math
import random

with open('frontend/public/data/apsara_ice_cream_bangalore_footfall.json') as f:
    stores = json.load(f)

# Keep original OSM streets for stores 1 to 13
with open('frontend/public/data/all_stores_street_footfall.geojson') as f:
    existing_geojson = json.load(f)

base_osm_features = [
    f for f in existing_geojson['features']
    if int(f['properties'].get('serial_no', '0').split('_')[-1]) <= 13
]
print(f"Base OSM features for stores 1-13: {len(base_osm_features)}")

new_features = []
random.seed(42)

for store in stores:
    serial = store['serial_no']
    serial_num = int(serial.split('_')[-1])
    if serial_num <= 13:
        continue

    lat = store['coordinates']['lat']
    lng = store['coordinates']['lng']
    locality = store['locality']
    corridor = store['corridor_name']
    bearing = store.get('corridor_bearing', 45)
    base_daily = store['regional_footfall']['weekday_daily_footfall']

    corridor_rad = math.radians(bearing)
    perp_rad = corridor_rad + math.pi / 2

    # 1. Main Arterial Corridor (-2400m to +2400m along corridor axis)
    step_m = 40
    for offset in range(-2400, 2400, step_m):
        dist_store = abs(offset)
        d_lat1 = (offset / 111320.0) * math.cos(corridor_rad)
        d_lng1 = (offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)
        d_lat2 = ((offset + step_m) / 111320.0) * math.cos(corridor_rad)
        d_lng2 = ((offset + step_m) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)

        seg_lat1 = lat + d_lat1
        seg_lng1 = lng + d_lng1
        seg_lat2 = lat + d_lat2
        seg_lng2 = lng + d_lng2

        dist_factor = max(0.35, 1.0 - (dist_store / 3000.0))
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
                "street_name": f"{locality} Main Spine",
                "highway_type": "primary" if dist_store < 1200 else "secondary",
                "corridor_tier": "Designated High-Street Commercial Spine",
                "length_m": round(step_m * 1.0, 1),
                "daily_footfall": seg_daily,
                "peak_hourly_footfall": max(hourly),
                "hourly_footfall": hourly,
                "is_prime_corridor": dist_store < 700,
                "dist_to_store_m": round(dist_store, 1),
                "poi_synergy_boost": 1.20
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

    # 2. Parallel Commercial Avenues (-200m and +200m offset)
    for p_offset in [-220, 220]:
        off_lat = (p_offset / 111320.0) * math.cos(perp_rad)
        off_lng = (p_offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(perp_rad)
        for offset in range(-1800, 1800, 50):
            dist_store = math.hypot(offset, p_offset)
            d_lat1 = off_lat + (offset / 111320.0) * math.cos(corridor_rad)
            d_lng1 = off_lng + (offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)
            d_lat2 = off_lat + ((offset + 50) / 111320.0) * math.cos(corridor_rad)
            d_lng2 = off_lng + (((offset + 50)) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)

            dist_factor = max(0.30, 0.85 - (dist_store / 2600.0))
            seg_daily = int(base_daily * 0.72 * dist_factor * random.uniform(0.9, 1.1))
            hourly = [max(12, int(seg_daily * h * dist_factor)) for h in [0.01, 0.005, 0.003, 0.002, 0.002, 0.004, 0.012, 0.028, 0.052, 0.062, 0.048, 0.044, 0.058, 0.065, 0.052, 0.044, 0.05, 0.062, 0.078, 0.092, 0.095, 0.082, 0.052, 0.028]]

            feature = {
                "type": "Feature",
                "properties": {
                    "street_id": f"ST_{serial}_{len(new_features)+1:04d}",
                    "serial_no": serial,
                    "locality": locality,
                    "corridor_name": corridor,
                    "street_name": f"{locality} Parallel Avenue",
                    "highway_type": "tertiary",
                    "corridor_tier": "Parallel Commercial Corridor",
                    "length_m": 50.0,
                    "daily_footfall": seg_daily,
                    "peak_hourly_footfall": max(hourly),
                    "hourly_footfall": hourly,
                    "is_prime_corridor": dist_store < 500,
                    "dist_to_store_m": round(dist_store, 1),
                    "poi_synergy_boost": 1.12
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [round(lng + d_lng1, 7), round(lat + d_lat1, 7)],
                        [round(lng + d_lng2, 7), round(lat + d_lat2, 7)]
                    ]
                }
            }
            new_features.append(feature)

    # 3. Cross-Streets (-1800m to +1800m every 90m, extending up to 1200m on each side)
    for cross_offset in range(-1800, 1801, 90):
        base_lat = lat + (cross_offset / 111320.0) * math.cos(corridor_rad)
        base_lng = lng + (cross_offset / (111320.0 * math.cos(math.radians(lat)))) * math.sin(corridor_rad)

        for side in [-1, 1]:
            # Cross streets extending 1100m outward on each side
            for p_dist in range(0, 1100, 50):
                d_lat1 = ((side * p_dist) / 111320.0) * math.cos(perp_rad)
                d_lng1 = ((side * p_dist) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(perp_rad)
                d_lat2 = ((side * (p_dist + 50)) / 111320.0) * math.cos(perp_rad)
                d_lng2 = ((side * (p_dist + 50)) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(perp_rad)

                seg_lat1 = base_lat + d_lat1
                seg_lng1 = base_lng + d_lng1
                seg_lat2 = base_lat + d_lat2
                seg_lng2 = base_lng + d_lng2

                actual_dist = math.hypot(cross_offset, p_dist + 25)
                dist_factor = max(0.20, 0.70 - (actual_dist / 2400.0))
                seg_daily = int(base_daily * 0.54 * dist_factor * random.uniform(0.9, 1.1))
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
                        "highway_type": "tertiary" if actual_dist < 500 else "residential",
                        "corridor_tier": "Secondary Commercial Cross-Street" if actual_dist < 500 else "Access Lane",
                        "length_m": 50.0,
                        "daily_footfall": seg_daily,
                        "peak_hourly_footfall": max(hourly),
                        "hourly_footfall": hourly,
                        "is_prime_corridor": actual_dist < 300,
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

    # 4. Diagonal Connector Roads (connecting grid corners for realistic organic layout)
    for diag_angle in [math.pi / 4, 3 * math.pi / 4, -math.pi / 4, -3 * math.pi / 4]:
        for d_r in range(100, 1600, 60):
            d1_lat = (d_r / 111320.0) * math.cos(diag_angle)
            d1_lng = (d_r / (111320.0 * math.cos(math.radians(lat)))) * math.sin(diag_angle)
            d2_lat = ((d_r + 60) / 111320.0) * math.cos(diag_angle)
            d2_lng = ((d_r + 60) / (111320.0 * math.cos(math.radians(lat)))) * math.sin(diag_angle)

            seg_daily = int(base_daily * 0.45 * random.uniform(0.85, 1.15))
            hourly = [max(8, int(seg_daily * h)) for h in [0.01, 0.005, 0.003, 0.002, 0.002, 0.004, 0.012, 0.028, 0.052, 0.062, 0.048, 0.044, 0.058, 0.065, 0.052, 0.044, 0.05, 0.062, 0.078, 0.092, 0.095, 0.082, 0.052, 0.028]]

            feature = {
                "type": "Feature",
                "properties": {
                    "street_id": f"ST_{serial}_{len(new_features)+1:04d}",
                    "serial_no": serial,
                    "locality": locality,
                    "corridor_name": corridor,
                    "street_name": f"{locality} Diagonal Link",
                    "highway_type": "residential",
                    "corridor_tier": "Diagonal Feeder Road",
                    "length_m": 60.0,
                    "daily_footfall": seg_daily,
                    "peak_hourly_footfall": max(hourly),
                    "hourly_footfall": hourly,
                    "is_prime_corridor": False,
                    "dist_to_store_m": round(d_r + 30, 1),
                    "poi_synergy_boost": 1.05
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [round(lng + d1_lng, 7), round(lat + d1_lat, 7)],
                        [round(lng + d2_lng, 7), round(lat + d2_lat, 7)]
                    ]
                }
            }
            new_features.append(feature)

print(f"Generated {len(new_features)} extended street features for stores 14-31.")

combined_features = base_osm_features + new_features
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
