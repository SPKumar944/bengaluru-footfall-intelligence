#!/usr/bin/env python3
"""
Pipeline Script 02: 150m x 150m Micro Mobility Grid & Customer Origin Flows
Generates Layer 4 at high spatial resolution (150m x 150m) across Bengaluru's
18 core commercial corridors with annual unique visitors, evening peak share,
travel time, and origin-destination desire lines.
"""

import os
import sys
import json
import math
import random
import logging
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon, Point
from pyproj import Transformer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [LAYER_4_MOBILITY] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("grid_150m")

with open("config/bengaluru_hubs.json", "r") as f:
    config = json.load(f)

PROJECTED_CRS = config["study_area"]["projected_crs"]
GEO_CRS = config["study_area"]["geographic_crs"]
HUBS = config["commercial_hubs"]

def generate_150m_mobility_grid():
    logger.info("Generating 150m x 150m Micro Mobility Grid across 18 Commercial Corridors...")
    transformer_to_proj = Transformer.from_crs(GEO_CRS, PROJECTED_CRS, always_xy=True)
    
    cell_size = 150.0 # 150 meters
    half_corridor_span_m = 1200.0 # 1.2 km radius around each commercial hub

    micro_cells = []
    cell_idx = 0
    generated_coords = set()

    random.seed(42)

    for hub in HUBS:
        h_x, h_y = transformer_to_proj.transform(hub["lon"], hub["lat"])
        hub_name = hub["name"]
        hub_type = hub.get("type", "Commercial")
        
        # Grid range around hub
        xs = np.arange(h_x - half_corridor_span_m, h_x + half_corridor_span_m, cell_size)
        ys = np.arange(h_y - half_corridor_span_m, h_y + half_corridor_span_m, cell_size)

        for x in xs:
            for y in ys:
                coord_key = (round(x, -1), round(y, -1))
                if coord_key in generated_coords:
                    continue
                generated_coords.add(coord_key)

                cell_idx += 1
                poly = Polygon([
                    (x, y),
                    (x + cell_size, y),
                    (x + cell_size, y + cell_size),
                    (x, y + cell_size),
                    (x, y)
                ])
                c_x = x + cell_size / 2.0
                c_y = y + cell_size / 2.0

                dist_to_hub_center = math.sqrt((c_x - h_x)**2 + (c_y - h_y)**2)
                
                # Gravity / Attractiveness decay from high street anchor
                decay = math.exp(-dist_to_hub_center / 550.0)
                
                # -------------------------------------------------------------
                # LAYER 4: MOBILITY & FOOTFALL DATA
                # -------------------------------------------------------------
                # Annual unique visitors (250,000 to 1,900,000 near core high-street)
                base_annual_visitors = 180000.0 + 1400000.0 * decay
                noise = random.uniform(0.92, 1.08)
                annual_visitors = int(base_annual_visitors * noise)

                # Evening footfall share % (7:00 PM – 11:00 PM dessert peak window)
                # Evening dessert peak is highest near dining corridors (42% - 56%)
                evening_share = round(38.0 + 16.0 * decay + random.uniform(-2.0, 3.0), 1)

                # Weighted average distance traveled by visitors (km)
                # Regional destination hubs (Indiranagar, Koramangala, Whitefield) draw from 5-9km
                is_destination = any(w in hub_name for w in ["Indiranagar", "Koramangala", "MG Road", "Whitefield", "Jayanagar"])
                base_dist_km = 6.2 if is_destination else 3.8
                avg_dist_km = round(base_dist_km + random.uniform(-0.6, 1.2), 2)

                # Weighted average travel time in minutes (calibrated to Bangalore traffic peak)
                # Travel time approx = dist_km * (2.8 to 3.8 min/km in urban peak)
                travel_time_min = round(avg_dist_km * random.uniform(2.8, 3.6), 1)

                # Fine UPI Velocity Index (0 - 100)
                upi_velocity = round(min(99.0, max(20.0, 30.0 + 65.0 * decay + random.uniform(-3, 3))), 1)

                micro_cells.append({
                    "cell_id_150m": f"CELL_150M_{cell_idx:05d}",
                    "hub_name": hub_name,
                    "hub_zone": hub["zone"],
                    "dist_to_hub_m": round(dist_to_hub_center, 1),
                    # Layer 4 Required Attributes
                    "unique_visitors_annual": annual_visitors,
                    "evening_footfall_share_pct": evening_share,
                    "weighted_avg_distance_km": avg_dist_km,
                    "weighted_avg_travel_time_min": travel_time_min,
                    "upi_velocity_score": upi_velocity,
                    "geometry": poly
                })

    gdf_150m = gpd.GeoDataFrame(micro_cells, crs=PROJECTED_CRS)
    logger.info(f"Generated {len(gdf_150m)} micro cells at 150m resolution.")

    # Convert to EPSG:4326 for GeoJSON
    gdf_4326 = gdf_150m.to_crs(GEO_CRS)

    out_file1 = "data/layers_geojson/layer4_mobility_150m.geojson"
    out_file2 = "frontend/public/data/layer4_mobility_150m.geojson"

    logger.info(f"Exporting to {out_file1} and {out_file2}...")
    gdf_4326.to_file(out_file1, driver="GeoJSON")
    gdf_4326.to_file(out_file2, driver="GeoJSON")

    # -------------------------------------------------------------
    # CUSTOMER ORIGIN-DESTINATION DESIRE LINES (visitor_origin_flows.json)
    # -------------------------------------------------------------
    logger.info("Synthesizing Customer Origin-Destination vectors...")
    
    # Key feeder residential localities across Bangalore
    feeder_localities = [
        {"name": "CV Raman Nagar", "lat": 12.9850, "lon": 77.6630},
        {"name": "Domlur / EGL", "lat": 12.9609, "lon": 77.6387},
        {"name": "BTM Layout 2nd Stage", "lat": 12.9166, "lon": 77.6101},
        {"name": "Tavarekere / SG Palya", "lat": 12.9280, "lon": 77.6080},
        {"name": "Koramangala 1st Block", "lat": 12.9230, "lon": 77.6320},
        {"name": "Harlur Road / Sarjapur", "lat": 12.9100, "lon": 77.6680},
        {"name": "Kasavanahalli Tech Pockets", "lat": 12.8950, "lon": 77.6820},
        {"name": "Kadugodi / Belathur", "lat": 12.9980, "lon": 77.7600},
        {"name": "Hope Farm / Channasandra", "lat": 12.9850, "lon": 77.7550},
        {"name": "Sadashivanagar", "lat": 13.0080, "lon": 77.5800},
        {"name": "Vyalikaval / Palace Guttahalli", "lat": 13.0010, "lon": 77.5820},
        {"name": "Basavanagudi Gandhi Bazaar", "lat": 12.9422, "lon": 77.5739},
        {"name": "Kumaraswamy Layout", "lat": 12.9050, "lon": 77.5580},
        {"name": "Kalyan Nagar Babusapalya", "lat": 13.0220, "lon": 77.6520},
        {"name": "Cooke Town / Richards Town", "lat": 12.9980, "lon": 77.6250},
        {"name": "Sahakar Nagar / Judicial Layout", "lat": 13.0600, "lon": 77.5880},
        {"name": "Vidyaranyapura", "lat": 13.0800, "lon": 77.5550},
        {"name": "Electronic City Phase 2", "lat": 12.8420, "lon": 77.6780}
    ]

    flows = []
    flow_id = 0

    for hub in HUBS:
        h_lat = hub["lat"]
        h_lon = hub["lon"]
        hub_name = hub["name"]

        # Connect 3 to 5 feeder localities to each hub based on proximity
        distances = []
        for feeder in feeder_localities:
            d = math.sqrt(((feeder["lat"] - h_lat) * 111.0)**2 + ((feeder["lon"] - h_lon) * 111.0 * math.cos(math.radians(h_lat)))**2)
            if 1.2 < d <= 9.5:
                distances.append((d, feeder))
        
        distances.sort(key=lambda x: x[0])
        selected_feeders = distances[:4]

        for dist_km, feeder in selected_feeders:
            flow_id += 1
            vol = int(random.randint(12000, 68000) / (dist_km ** 0.8))
            travel_time = round(dist_km * random.uniform(2.6, 3.8), 1)

            flows.append({
                "flow_id": f"FLOW_{flow_id:04d}",
                "dest_hub_id": hub["hub_id"],
                "dest_hub_name": hub_name,
                "dest_coords": [h_lon, h_lat],
                "origin_locality_name": feeder["name"],
                "origin_coords": [feeder["lon"], feeder["lat"]],
                "distance_km": round(dist_km, 2),
                "avg_travel_time_min": travel_time,
                "visitor_flow_volume": vol,
                "flow_intensity": round(min(1.0, vol / 45000.0), 2)
            })

    out_flows1 = "data/layers_geojson/visitor_origin_flows.json"
    out_flows2 = "frontend/public/data/visitor_origin_flows.json"

    with open(out_flows1, "w") as f:
        json.dump(flows, f, indent=2)
    with open(out_flows2, "w") as f:
        json.dump(flows, f, indent=2)

    logger.info(f"Done: Exported {len(flows)} origin-destination desire lines.")
    return len(gdf_4326), len(flows)

if __name__ == "__main__":
    generate_150m_mobility_grid()
