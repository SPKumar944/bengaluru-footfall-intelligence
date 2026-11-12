import json
import math
import os
import h3

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000.0  # meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
    return 2.0 * R * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

def main():
    print("Loading datasets for H3 expansion suitability...")
    with open('frontend/public/data/apsara_ice_cream_bangalore_footfall.json') as f:
        stores = json.load(f)
    with open('frontend/public/data/h3_commercial_residential_indices.json') as f:
        h3_indices = json.load(f)['hexagons']
    with open('frontend/public/data/layer5_competitors.geojson') as f:
        competitors = json.load(f)['features']
    with open('frontend/public/data/layer6_complementary_brands.geojson') as f:
        dining = json.load(f)['features']
    with open('frontend/public/data/kids_family_attractions.geojson') as f:
        kids_pois = json.load(f)['features']
    with open('frontend/public/data/education_youth_pois.geojson') as f:
        edu_pois = json.load(f)['features']
    with open('frontend/public/data/mapped_tech_parks.geojson') as f:
        tech_parks = json.load(f)['features']
    with open('reports/apsara_new_store_location_recommendations.json') as f:
        corridors = json.load(f)

    # Pre-extract POI coordinates for fast spatial distance checks
    comp_coords = [(f['geometry']['coordinates'][1], f['geometry']['coordinates'][0], f['properties'].get('brand', 'Competitor')) for f in competitors]
    dining_coords = [(f['geometry']['coordinates'][1], f['geometry']['coordinates'][0]) for f in dining]
    kids_coords = [(f['geometry']['coordinates'][1], f['geometry']['coordinates'][0]) for f in kids_pois]
    edu_coords = [(f['geometry']['coordinates'][1], f['geometry']['coordinates'][0]) for f in edu_pois]
    tech_coords = [(f['geometry']['coordinates'][1], f['geometry']['coordinates'][0]) for f in tech_parks]

    # Pre-calculate nearest corridor for candidate labeling
    corridor_centers = [(c['lat'], c['lng'], c['name'], c['zone'], c['rank']) for c in corridors]

    expansion_hexagons = []
    
    print(f"Scoring {len(h3_indices)} hexagons across Bengaluru...")

    for hex_item in h3_indices:
        h = hex_item['h']
        hlat, hlng = h3.cell_to_latlng(h)
        res_pop = hex_item.get('res_pop', 0)
        com_workers = hex_item.get('com_workers', 0)
        kids = hex_item.get('kids', 0)
        youth = hex_item.get('youth', 0)
        off_m2 = hex_item.get('off_m2', 0)
        res_built_m2 = hex_item.get('res_built_m2', 0)
        off_cnt = hex_item.get('off_cnt', 0)
        ward = hex_item.get('ward', 'Bengaluru')
        
        # Distance to nearest existing Apsara store
        min_dist = 999999.0
        nearest_store_locality = "HSR Layout"
        nearest_store_sn = "APSARA_BLR_01"
        for s in stores:
            d = haversine(hlat, hlng, s['coordinates']['lat'], s['coordinates']['lng'])
            if d < min_dist:
                min_dist = d
                nearest_store_locality = s['locality']
                nearest_store_sn = s['serial_no']

        dist_km = round(min_dist / 1000.0, 2)

        # Skip remote empty rural cells
        if res_pop < 10 and com_workers < 5 and off_m2 < 50:
            continue

        # Proximity to candidate corridors
        nearest_corr_name = ""
        nearest_corr_zone = ""
        nearest_corr_rank = 99
        min_corr_dist = 999999.0
        for clat, clng, cname, czone, crank in corridor_centers:
            cdist = haversine(hlat, hlng, clat, clng)
            if cdist < min_corr_dist:
                min_corr_dist = cdist
                nearest_corr_name = cname
                nearest_corr_zone = czone
                nearest_corr_rank = crank

        # Local POI density in ~750m walking radius around hexagon
        local_comps = sum(1 for clat, clng, _ in comp_coords if haversine(hlat, hlng, clat, clng) <= 750)
        local_dining = sum(1 for dlat, dlng in dining_coords if haversine(hlat, hlng, dlat, dlng) <= 750)
        local_kids = sum(1 for klat, klng in kids_coords if haversine(hlat, hlng, klat, klng) <= 750)
        local_edu = sum(1 for elat, elng in edu_coords if haversine(hlat, hlng, elat, elng) <= 750)
        local_tech = sum(1 for tlat, tlng in tech_coords if haversine(hlat, hlng, tlat, tlng) <= 1500)

        # 1. Demographic Score (0 - 100)
        demo_score = min(100.0, (res_pop / 3500.0 * 50.0) + (kids / 400.0 * 30.0) + (youth / 350.0 * 20.0))

        # 2. Commercial / Daytime Demand Score (0 - 100)
        com_score = min(100.0, (com_workers / 2500.0 * 55.0) + (off_m2 / 30000.0 * 35.0) + (min(3, local_tech) * 3.3))

        # 3. Retail & Dining Synergy Score (0 - 100)
        syn_score = min(100.0, 
            (min(6, local_dining) * 7.0) + 
            (min(3, local_kids) * 12.0) + 
            (min(3, local_edu) * 8.0) + 
            (min(4, local_comps) * 6.0) + 
            (10.0 if hex_item.get('cls') in ('commercial', 'mixed') else 0.0)
        )

        # 4. Distance / Cannibalization Compliance Multiplier
        if dist_km < 3.0:
            dist_factor = max(0.15, (dist_km / 3.0) * 0.45)
            tier = "Cannibalization Risk (<3km)"
            raw_suitability = (demo_score * 0.35) + (com_score * 0.25) + (syn_score * 0.40)
            suit_score = min(100.0, max(5.0, round(raw_suitability * dist_factor, 1)))
        elif 3.0 <= dist_km <= 5.5:
            if 3.2 <= dist_km <= 4.8:
                dist_factor = 1.0
            else:
                dist_factor = 0.92
            
            raw_suitability = (demo_score * 0.35) + (com_score * 0.25) + (syn_score * 0.40)
            
            # Boost if within 1.2km of top candidate high-streets
            if min_corr_dist <= 1200:
                corr_boost = max(0.0, (1.0 - (min_corr_dist / 1200.0)) * 18.0)
                raw_suitability += corr_boost

            suit_score = min(100.0, max(5.0, round(raw_suitability * dist_factor, 1)))

            if suit_score >= 75.0:
                tier = "Prime Expansion (75–100)"
            elif suit_score >= 60.0:
                tier = "High Potential (60–74)"
            elif suit_score >= 45.0:
                tier = "Moderate Viability (45–59)"
            else:
                tier = "Sub-Optimal (<45)"
        else:
            dist_factor = max(0.35, 1.0 - ((dist_km - 5.5) / 10.0) * 0.5)
            raw_suitability = (demo_score * 0.35) + (com_score * 0.25) + (syn_score * 0.40)
            suit_score = min(100.0, max(5.0, round(raw_suitability * dist_factor, 1)))
            tier = "Outer Fringe (>5.5km)"

        # Projected daily cups & revenue
        proj_cups = int(round(
            max(45, min(180, (res_pop * 0.006) + (com_workers * 0.004) + (local_dining * 4.5) + (local_kids * 8.0) + (suit_score * 0.45)))
        ))
        proj_monthly_rev_lakhs = round((proj_cups * 30.4 * 185) / 100000.0, 1)

        expansion_hexagons.append({
            "h": h,
            "suit_score": int(round(suit_score)),
            "tier": tier,
            "dist_km": dist_km,
            "nearest_store": nearest_store_locality,
            "store_sn": nearest_store_sn,
            "in_golden_band": 3.0 <= dist_km <= 5.5,
            "res_pop": int(res_pop),
            "com_workers": int(com_workers),
            "kids": int(kids),
            "youth": int(youth),
            "off_m2": int(round(off_m2)),
            "res_built_m2": int(round(res_built_m2)),
            "off_cnt": int(off_cnt),
            "cls": hex_item.get('cls', 'residential'),
            "ward": ward,
            "corridor": nearest_corr_name if min_corr_dist <= 1500 else "",
            "corridor_rank": nearest_corr_rank if min_corr_dist <= 1500 else None,
            "comp_count": local_comps,
            "dining_count": local_dining,
            "kids_count": local_kids,
            "proj_cups": proj_cups,
            "proj_rev": proj_monthly_rev_lakhs
        })

    # Sort by golden band and suitability score descending
    expansion_hexagons.sort(key=lambda x: (x['in_golden_band'], x['suit_score']), reverse=True)

    golden_band_hexes = [h for h in expansion_hexagons if h['in_golden_band']]
    prime_hexes = [h for h in golden_band_hexes if h['suit_score'] >= 75]
    high_hexes = [h for h in golden_band_hexes if 60 <= h['suit_score'] < 75]
    moderate_hexes = [h for h in golden_band_hexes if 45 <= h['suit_score'] < 60]

    output_data = {
        "metadata": {
            "title": "Apsara Ice Creams — Bengaluru New Store Expansion Hexagon Suitability Layer",
            "h3_resolution": 9,
            "radius_constraint_min_km": 3.0,
            "radius_constraint_max_km": 5.5,
            "total_scored_hexagons": len(expansion_hexagons),
            "golden_band_hexagons": len(golden_band_hexes),
            "counts": {
                "prime": len(prime_hexes),
                "high": len(high_hexes),
                "moderate": len(moderate_hexes),
                "suboptimal": len(golden_band_hexes) - len(prime_hexes) - len(high_hexes) - len(moderate_hexes)
            }
        },
        "hexagons": expansion_hexagons
    }

    out_path = 'frontend/public/data/h3_new_store_suitability.json'
    with open(out_path, 'w') as f:
        json.dump(output_data, f, separators=(',', ':'))

    print(f"Successfully generated {out_path} ({round(os.path.getsize(out_path)/(1024*1024), 2)} MB)")

if __name__ == '__main__':
    main()
