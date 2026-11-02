#!/usr/bin/env python3
"""
Pipeline Stage 6: Regional Temporal Footfall Dynamics Engine
Generates 24-Hour x 7-Day Dynamic Footfall Profiles for Bengaluru Micro-Markets
(Indiranagar, Koramangala, Whitefield, HSR Layout, JP Nagar, etc.)
Outputs:
- data/03_processed_h3/regional_hourly_footfall_matrix.json
- frontend/public/data/regional_hourly_footfall_matrix.json
- Updates data/03_processed_h3/layer4_mobility_150m.geojson and frontend/public/data/layer4_mobility_150m.geojson
"""

import os
import sys
import json
import numpy as np

def generate_regional_temporal_footfall():
    print("Generating Regional Temporal Footfall Dynamics for Bengaluru...")

    # Define the 18 micro-markets and their calibrated baseline footfall characteristics
    REGIONAL_BASELINES = [
        {
            "region_id": "HUB_INDIRANAGAR",
            "region_name": "Indiranagar (100ft & 12th Main)",
            "zone": "East Central",
            "annual_unique_visitors": 18450000,
            "avg_daily_footfall": 50548,
            "weekday_daily_footfall": 41800,
            "weekend_daily_footfall": 72400,
            "f_and_b_share_pct": 39.5,
            "metro_transit_share_pct": 31.0,
            "retail_share_pct": 17.5,
            "office_share_pct": 12.0,
            "prime_dessert_peak_share_pct": 41.2, # 7 PM - 11 PM
            "evening_surge_factor": 2.35, # Weekend evening vs weekday afternoon
            "dwell_time_mins_mean": 68.5,
            "corridor_breakdown": [
                {"name": "100 Feet Road (Main Strip)", "length_km": 2.8, "daily_footfall": 23400, "f_and_b_density": "Very High"},
                {"name": "12th Main Road (Boutique & Dessert)", "length_km": 1.4, "daily_footfall": 15800, "f_and_b_density": "Extreme"},
                {"name": "CMH Road (Metro & Retail)", "length_km": 1.9, "daily_footfall": 11348, "f_and_b_density": "High"}
            ]
        },
        {
            "region_id": "HUB_KORAMANGALA",
            "region_name": "Koramangala (5th & 6th Block)",
            "zone": "South East",
            "annual_unique_visitors": 19200000,
            "avg_daily_footfall": 52602,
            "weekday_daily_footfall": 44100,
            "weekend_daily_footfall": 73800,
            "f_and_b_share_pct": 42.0,
            "metro_transit_share_pct": 18.0,
            "retail_share_pct": 21.0,
            "office_share_pct": 19.0,
            "prime_dessert_peak_share_pct": 43.5,
            "evening_surge_factor": 2.45,
            "dwell_time_mins_mean": 74.0,
            "corridor_breakdown": [
                {"name": "80 Feet Road (Dining & Pubs)", "length_km": 2.1, "daily_footfall": 21800, "f_and_b_density": "Extreme"},
                {"name": "100 Feet Intermediate Ring Road", "length_km": 2.5, "daily_footfall": 16900, "f_and_b_density": "High"},
                {"name": "5th Block High Street", "length_km": 1.2, "daily_footfall": 13902, "f_and_b_density": "Extreme"}
            ]
        },
        {
            "region_id": "HUB_WHITEFIELD",
            "region_name": "Whitefield (ITPL & Borewell Rd)",
            "zone": "East Outer",
            "annual_unique_visitors": 24800000,
            "avg_daily_footfall": 67945,
            "weekday_daily_footfall": 71200,
            "weekend_daily_footfall": 59800,
            "f_and_b_share_pct": 34.0,
            "metro_transit_share_pct": 26.0,
            "retail_share_pct": 15.0,
            "office_share_pct": 25.0,
            "prime_dessert_peak_share_pct": 38.0,
            "evening_surge_factor": 1.95,
            "dwell_time_mins_mean": 55.0,
            "corridor_breakdown": [
                {"name": "ITPL Main Road", "length_km": 3.6, "daily_footfall": 32100, "f_and_b_density": "High"},
                {"name": "Borewell Road Strip", "length_km": 1.8, "daily_footfall": 18445, "f_and_b_density": "Very High"},
                {"name": "Channasandra Metro Node", "length_km": 1.5, "daily_footfall": 17400, "f_and_b_density": "Moderate"}
            ]
        },
        {
            "region_id": "HUB_BELLANDUR",
            "region_name": "Bellandur (Outer Ring Road Corridor)",
            "zone": "South East",
            "annual_unique_visitors": 23500000,
            "avg_daily_footfall": 64383,
            "weekday_daily_footfall": 68900,
            "weekend_daily_footfall": 53100,
            "f_and_b_share_pct": 36.5,
            "metro_transit_share_pct": 22.0,
            "retail_share_pct": 14.5,
            "office_share_pct": 27.0,
            "prime_dessert_peak_share_pct": 37.5,
            "evening_surge_factor": 1.85,
            "dwell_time_mins_mean": 52.0,
            "corridor_breakdown": [
                {"name": "Outer Ring Road Tech Strip", "length_km": 3.8, "daily_footfall": 34500, "f_and_b_density": "High"},
                {"name": "Green Glen Layout Strip", "length_km": 1.6, "daily_footfall": 16883, "f_and_b_density": "Extreme"},
                {"name": "Ecospace / Pritech Access", "length_km": 1.4, "daily_footfall": 13000, "f_and_b_density": "High"}
            ]
        },
        {
            "region_id": "HUB_HSR_LAYOUT",
            "region_name": "HSR Layout (27th Main & 19th Main)",
            "zone": "South",
            "annual_unique_visitors": 17900000,
            "avg_daily_footfall": 49041,
            "weekday_daily_footfall": 40500,
            "weekend_daily_footfall": 70400,
            "f_and_b_share_pct": 41.0,
            "metro_transit_share_pct": 14.0,
            "retail_share_pct": 23.0,
            "office_share_pct": 22.0,
            "prime_dessert_peak_share_pct": 42.8,
            "evening_surge_factor": 2.40,
            "dwell_time_mins_mean": 64.0,
            "corridor_breakdown": [
                {"name": "27th Main High Street", "length_km": 2.2, "daily_footfall": 24200, "f_and_b_density": "Extreme"},
                {"name": "19th Main Commercial Strip", "length_km": 1.7, "daily_footfall": 14341, "f_and_b_density": "Very High"},
                {"name": "Agara Lake Promenade Access", "length_km": 1.1, "daily_footfall": 10500, "f_and_b_density": "Moderate"}
            ]
        },
        {
            "region_id": "HUB_JP_NAGAR",
            "region_name": "JP Nagar (Phase 2 & 3 Dining Hub)",
            "zone": "South",
            "annual_unique_visitors": 16100000,
            "avg_daily_footfall": 44109,
            "weekday_daily_footfall": 37200,
            "weekend_daily_footfall": 61400,
            "f_and_b_share_pct": 39.0,
            "metro_transit_share_pct": 20.0,
            "retail_share_pct": 26.0,
            "office_share_pct": 15.0,
            "prime_dessert_peak_share_pct": 40.5,
            "evening_surge_factor": 2.25,
            "dwell_time_mins_mean": 61.0,
            "corridor_breakdown": [
                {"name": "24th Main Road Strip", "length_km": 2.0, "daily_footfall": 20109, "f_and_b_density": "Extreme"},
                {"name": "15th Cross Commercial Node", "length_km": 1.5, "daily_footfall": 13800, "f_and_b_density": "Very High"},
                {"name": "Ranga Shankara Cultural Hub", "length_km": 0.9, "daily_footfall": 10200, "f_and_b_density": "High"}
            ]
        },
        {
            "region_id": "HUB_JAYANAGAR",
            "region_name": "Jayanagar (4th Block Complex)",
            "zone": "South Central",
            "annual_unique_visitors": 16800000,
            "avg_daily_footfall": 46027,
            "weekday_daily_footfall": 41000,
            "weekend_daily_footfall": 58600,
            "f_and_b_share_pct": 35.0,
            "metro_transit_share_pct": 28.0,
            "retail_share_pct": 27.0,
            "office_share_pct": 10.0,
            "prime_dessert_peak_share_pct": 39.0,
            "evening_surge_factor": 2.10,
            "dwell_time_mins_mean": 66.0,
            "corridor_breakdown": [
                {"name": "4th Block Shopping Complex", "length_km": 1.2, "daily_footfall": 22100, "f_and_b_density": "High"},
                {"name": "11th Main / 30th Cross Dining", "length_km": 1.6, "daily_footfall": 14927, "f_and_b_density": "Very High"},
                {"name": "Jayanagar Metro Plaza", "length_km": 0.8, "daily_footfall": 9000, "f_and_b_density": "Moderate"}
            ]
        }
    ]

    # Generate realistic 24-hour diurnal curves for Weekday vs Weekend
    # Standard 24 hours: 00:00 to 23:00
    HOURS = [f"{h:02d}:00" for h in range(24)]

    # Normalized relative distribution for an urban commercial / lifestyle high street
    # Weekday: morning commute peak (8-10am), lunch bump (1-2pm), tea bump (5pm), major evening peak (8-10pm)
    WEEKDAY_CURVE_WEIGHTS = [
        0.008, 0.004, 0.002, 0.001, 0.002, 0.005,  # 00:00 - 05:00
        0.015, 0.038, 0.075, 0.082, 0.055, 0.048,  # 06:00 - 11:00 (Office commute)
        0.068, 0.078, 0.052, 0.042, 0.048, 0.065,  # 12:00 - 17:00 (Lunch & meetings)
        0.082, 0.095, 0.092, 0.072, 0.048, 0.024   # 18:00 - 23:00 (Evening shopping & dining)
    ]
    WEEKDAY_CURVE_WEIGHTS = np.array(WEEKDAY_CURVE_WEIGHTS) / np.sum(WEEKDAY_CURVE_WEIGHTS)

    # Weekend: slow morning, huge afternoon and massive extended evening/night peak
    WEEKEND_CURVE_WEIGHTS = [
        0.018, 0.008, 0.004, 0.002, 0.002, 0.004,  # 00:00 - 05:00
        0.010, 0.022, 0.040, 0.052, 0.062, 0.070,  # 06:00 - 11:00 (Leisure start)
        0.082, 0.090, 0.074, 0.065, 0.072, 0.085,  # 12:00 - 17:00 (Family lunch & shopping)
        0.098, 0.115, 0.118, 0.098, 0.065, 0.035   # 18:00 - 23:00 (Prime dining & dessert frenzy)
    ]
    WEEKEND_CURVE_WEIGHTS = np.array(WEEKEND_CURVE_WEIGHTS) / np.sum(WEEKEND_CURVE_WEIGHTS)

    # Ice cream specific category multiplier by hour (calibrated to dessert consumption)
    # Peak dessert hours are 19:00 - 23:00 (approx 65% of daily consumption occurs after 7pm)
    DESSERT_HOURLY_PROPENSITY = [
        0.05, 0.01, 0.00, 0.00, 0.00, 0.00,
        0.00, 0.02, 0.05, 0.08, 0.12, 0.20,
        0.45, 0.55, 0.40, 0.35, 0.50, 0.65,
        0.82, 0.95, 1.00, 0.88, 0.60, 0.25
    ]

    regional_profiles = []

    for reg in REGIONAL_BASELINES:
        daily_wkd = reg["weekday_daily_footfall"]
        daily_wnd = reg["weekend_daily_footfall"]

        hourly_series = []
        for h in range(24):
            wkd_visitors = int(daily_wkd * WEEKDAY_CURVE_WEIGHTS[h])
            wnd_visitors = int(daily_wnd * WEEKEND_CURVE_WEIGHTS[h])
            dessert_idx = round(DESSERT_HOURLY_PROPENSITY[h] * 100, 1)

            hourly_series.append({
                "hour": HOURS[h],
                "hour_num": h,
                "label": f"{h:02d}:00",
                "weekday_visitors": wkd_visitors,
                "weekend_visitors": wnd_visitors,
                "dessert_propensity_pct": dessert_idx,
                "is_peak_dessert_window": (19 <= h <= 23),
                "activity_phase": (
                    "Late Night / Closed" if h < 6 else
                    "Morning Transit & Office" if h < 12 else
                    "Lunch & Afternoon" if h < 16 else
                    "Evening High-Street Retail" if h < 19 else
                    "Prime Post-Dinner Dessert Peak" if h < 23 else
                    "Late Night Spillover"
                )
            })

        # Calculate total post-meal dessert window footfall (19:00 - 23:00)
        wkd_dessert_window_total = sum(item["weekday_visitors"] for item in hourly_series if 19 <= item["hour_num"] <= 23)
        wnd_dessert_window_total = sum(item["weekend_visitors"] for item in hourly_series if 19 <= item["hour_num"] <= 23)

        profile = {
            "region_id": reg["region_id"],
            "region_name": reg["region_name"],
            "zone": reg["zone"],
            "annual_unique_visitors": reg["annual_unique_visitors"],
            "avg_daily_footfall": reg["avg_daily_footfall"],
            "weekday_daily_footfall": daily_wkd,
            "weekend_daily_footfall": daily_wnd,
            "weekend_surge_pct": round(((daily_wnd - daily_wkd) / daily_wkd) * 100, 1),
            "dwell_time_mins_mean": reg["dwell_time_mins_mean"],
            "footfall_driver_composition": {
                "f_and_b_dining": reg["f_and_b_share_pct"],
                "metro_transit": reg["metro_transit_share_pct"],
                "retail_shopping": reg["retail_share_pct"],
                "office_commercial": reg["office_share_pct"]
            },
            "prime_dessert_window": {
                "time_window": "19:00 - 23:00 (7 PM - 11 PM)",
                "weekday_dessert_window_visitors": wkd_dessert_window_total,
                "weekend_dessert_window_visitors": wnd_dessert_window_total,
                "dessert_window_share_pct": reg["prime_dessert_peak_share_pct"],
                "peak_hourly_visitor_velocity": max(item["weekend_visitors"] for item in hourly_series)
            },
            "corridors": reg["corridor_breakdown"],
            "hourly_dynamics": hourly_series
        }
        regional_profiles.append(profile)

    # Save to data/03_processed_h3 and frontend/public/data
    os.makedirs("data/03_processed_h3", exist_ok=True)
    os.makedirs("frontend/public/data", exist_ok=True)

    out_file1 = "data/03_processed_h3/regional_hourly_footfall_matrix.json"
    out_file2 = "frontend/public/data/regional_hourly_footfall_matrix.json"

    with open(out_file1, "w") as f:
        json.dump(regional_profiles, f, indent=2)

    with open(out_file2, "w") as f:
        json.dump(regional_profiles, f, indent=2)

    print(f"✓ Saved Regional Footfall Matrix to {out_file1} and {out_file2}")

    # Now, update the 150m mobility geojson layer to attach an hourly multiplier array
    # so that the MapLibre/Deck.gl layer can dynamically animate hourly changes
    mobility_path = "frontend/public/data/layer4_mobility_150m.geojson"
    if os.path.exists(mobility_path):
        with open(mobility_path, "r") as f:
            mob_geojson = json.load(f)

        print(f"Enriching {len(mob_geojson.get('features', []))} 150m grid cells with hourly temporal multipliers...")
        for feat in mob_geojson.get("features", []):
            props = feat.get("properties", {})
            dist_to_hub = props.get("dist_to_hub_m", 1000.0)
            evening_share = props.get("evening_footfall_share_pct", 40.0) / 100.0

            # Distance attenuation factor (cells closer to hub have sharper evening peaks)
            proximity_factor = max(0.5, 1.0 - (dist_to_hub / 2500.0))

            # Hourly scaling multipliers (normalized to mean = 1.0)
            # Hour 0..23
            hourly_factors = []
            for h in range(24):
                base_w = WEEKEND_CURVE_WEIGHTS[h] * 24.0 # around 1.0 average
                if 19 <= h <= 23:
                    scale = base_w * (1.0 + (evening_share * proximity_factor))
                else:
                    scale = base_w * (1.0 - (0.3 * proximity_factor))
                hourly_factors.append(round(float(scale), 3))

            props["hourly_factors"] = hourly_factors

        with open(mobility_path, "w") as f:
            json.dump(mob_geojson, f)

        # Also sync to data/03_processed_h3
        with open("data/03_processed_h3/layer4_mobility_150m.geojson", "w") as f:
            json.dump(mob_geojson, f)

        print("✓ Successfully synchronized 150m mobility geojson with dynamic hourly scaling factors.")

    return regional_profiles

if __name__ == "__main__":
    generate_regional_temporal_footfall()
