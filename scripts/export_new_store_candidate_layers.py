import json

with open('reports/apsara_new_store_location_recommendations.json') as f:
    candidates = json.load(f)

# Build GeoJSON FeatureCollection
features = []
for c in candidates:
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [c["lng"], c["lat"]]
        },
        "properties": {
            "candidate_id": c["candidate_id"],
            "rank": c["rank"],
            "name": c["name"],
            "corridor": c["corridor"],
            "locality": c["locality"],
            "zone": c["zone"],
            "corridor_type": c["corridor_type"],
            "analog_benchmark": c["analog_benchmark"],
            "benchmark_serial": c["benchmark_serial"],
            "min_distance_km": c["min_distance_km"],
            "nearest_store_locality": c["nearest_store_locality"],
            "nearest_store_serial": c["nearest_store_serial"],
            "cannibalization_risk_pct": c["cannibalization_risk_pct"],
            "overall_suitability_score": c["scores"]["overall_suitability_score"],
            "demographic_score": c["scores"]["demographic_score"],
            "commercial_score": c["scores"]["commercial_score"],
            "synergy_score": c["scores"]["synergy_score"],
            "white_space_score": c["scores"]["white_space_score"],
            "projected_daily_cups": c["financial_projections"]["projected_daily_cups"],
            "projected_monthly_revenue_lakhs": c["financial_projections"]["projected_monthly_revenue_lakhs"],
            "projected_monthly_customers": c["financial_projections"]["projected_monthly_customers"],
            "est_payback_months": c["financial_projections"]["est_payback_months"],
            "walkshed_pop_15k": c["demographics"]["walkshed_pop_15k"],
            "kids_cohort_15k": c["demographics"]["kids_cohort_15k"],
            "youth_cohort_15k": c["demographics"]["youth_cohort_15k"],
            "workforce_15k": c["commercial"]["workforce_15k"],
            "office_floor_m2": c["commercial"]["office_floor_m2"],
            "competitor_count_15k": c["competition"]["competitor_count_15k"],
            "competitor_brands": c["competition"]["competitor_brands"],
            "total_dining_transit": c["synergy_anchors"]["total_dining_transit"],
            "kids_family_attractions": c["synergy_anchors"]["kids_family_attractions"]
        }
    }
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "name": "Apsara_New_Store_Expansion_Candidates_Ranked",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": features
}

with open('frontend/public/data/new_store_candidates_ranked.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)

with open('frontend/public/data/new_store_candidates_ranked.json', 'w') as f:
    json.dump(candidates, f, indent=2)

print("Exported new_store_candidates_ranked.geojson and .json successfully.")
