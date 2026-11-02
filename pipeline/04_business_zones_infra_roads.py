#!/usr/bin/env python3
"""
Pipeline Script 04: Business Zones (Polygons), Infrastructure Amenities (Points),
and Road Hierarchy / Traffic Congestion (LineStrings).
Outputs Layer 7, Layer 8, and Bonus Layer 9.
"""

import os
import sys
import json
import math
import random
import logging
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon, Point, LineString
from pyproj import Transformer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [LAYERS_7_8_ROADS] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("zones_infra_roads")

with open("config/bengaluru_hubs.json", "r") as f:
    config = json.load(f)

PROJECTED_CRS = config["study_area"]["projected_crs"]
GEO_CRS = config["study_area"]["geographic_crs"]
HUBS = config["commercial_hubs"]

def build_layer7_business_zones():
    logger.info("Delineating Layer 7: Commercial Business Zones (Polygons)...")
    transformer_to_proj = Transformer.from_crs(GEO_CRS, PROJECTED_CRS, always_xy=True)
    transformer_to_geo = Transformer.from_crs(PROJECTED_CRS, GEO_CRS, always_xy=True)

    zones = []
    zone_idx = 0

    for hub in HUBS:
        zone_idx += 1
        h_x, h_y = transformer_to_proj.transform(hub["lon"], hub["lat"])
        
        # Determine polygon dimensions based on hub archetype
        is_linear_highstreet = "100ft" in hub["name"] or "Main" in hub["name"] or "Sampige" in hub["name"]
        
        if is_linear_highstreet:
            # Elongated retail strip (e.g. 1.8km x 450m)
            dx = 900.0
            dy = 250.0
            z_type = "High Street"
        elif "ITPL" in hub["name"] or "Ecospace" in hub["name"] or "Electronic City" in hub["name"]:
            dx = 750.0
            dy = 750.0
            z_type = "IT Corridor Hub"
        elif "MG Road" in hub["name"] or "Church" in hub["name"]:
            dx = 800.0
            dy = 500.0
            z_type = "High Street"
        else:
            dx = 600.0
            dy = 600.0
            z_type = "Neighborhood Commercial Center"

        # Construct polygon in metric CRS
        poly_coords_proj = [
            (h_x - dx, h_y - dy),
            (h_x + dx, h_y - dy),
            (h_x + dx * 0.95, h_y + dy * 1.05),
            (h_x - dx * 0.9, h_y + dy),
            (h_x - dx, h_y - dy)
        ]
        poly_proj = Polygon(poly_coords_proj)
        area_sq_km = round(poly_proj.area / 1e6, 2)

        # Reproject to WGS84
        poly_coords_geo = [transformer_to_geo.transform(x, y) for x, y in poly_coords_proj]
        poly_geo = Polygon(poly_coords_geo)

        shop_count = int(area_sq_km * random.randint(220, 380))
        comm_bldgs = int(shop_count * random.uniform(0.18, 0.28))
        rent = hub.get("avg_commercial_rent_sqft", 250)

        # Parking availability score: lower in congested high streets, higher in tech corridors
        parking_score = 35 if is_linear_highstreet else (75 if z_type == "IT Corridor Hub" else 55)

        zones.append({
            "type": "Feature",
            "properties": {
                "zone_id": f"BZ_{zone_idx:02d}",
                "zone_name": f"{hub['name']} Commercial District",
                "zone_type": z_type,
                "area_sq_km": area_sq_km,
                "count_of_shops": shop_count,
                "count_of_commercial_buildings": comm_bldgs,
                "avg_commercial_rent_sqft": rent,
                "parking_availability_score": parking_score,
                "daily_floating_footfall": shop_count * random.randint(18, 35)
            },
            "geometry": poly_geo.__geo_interface__
        })

    gdf = gpd.GeoDataFrame.from_features(zones, crs=GEO_CRS)
    out1 = "data/layers_geojson/layer7_business_zones.geojson"
    out2 = "frontend/public/data/layer7_business_zones.geojson"
    gdf.to_file(out1, driver="GeoJSON")
    gdf.to_file(out2, driver="GeoJSON")
    logger.info(f"Exported Layer 7 with {len(gdf)} Commercial Business Zones.")
    return len(gdf)

def build_layer8_infra_amenities():
    logger.info("Extracting Layer 8: Infrastructure & Amenity Locations (8 Exact Client Categories)...")
    
    amenities = [
        # 1. Railway Station & Metro
        {"category": "Railway Station", "name": "Krantivira Sangolli Rayanna (Majestic) Station", "lat": 12.9778, "lon": 77.5700, "address": "Gubbi Thotadappa Rd, Majestic", "impact": 98},
        {"category": "Railway Station", "name": "Yesvantpur Junction Railway Station", "lat": 13.0238, "lon": 77.5503, "address": "Dr. Ambedkar Nagar, Yeshwanthpur", "impact": 92},
        {"category": "Railway Station", "name": "Namma Metro Interchange — Nadaprabhu Kempegowda", "lat": 12.9757, "lon": 77.5728, "address": "Majestic Metro Interchange", "impact": 99},
        {"category": "Railway Station", "name": "Namma Metro — Indiranagar Station (Purple Line)", "lat": 12.9783, "lon": 77.6386, "address": "CMH Road, Indiranagar", "impact": 88},
        {"category": "Railway Station", "name": "Namma Metro — Trinity & MG Road Stations", "lat": 12.9729, "lon": 77.6166, "address": "MG Road / Trinity Circle", "impact": 90},
        {"category": "Railway Station", "name": "Namma Metro — Jayanagar Station (Green Line)", "lat": 12.9382, "lon": 77.5801, "address": "4th Block, Jayanagar", "impact": 85},
        {"category": "Railway Station", "name": "Namma Metro — Whitefield Kadugodi Terminal", "lat": 12.9982, "lon": 77.7610, "address": "Kadugodi, Whitefield", "impact": 86},
        {"category": "Railway Station", "name": "K.R. Puram Railway & Interchange Node", "lat": 12.9960, "lon": 77.6780, "address": "Old Madras Road, KR Puram", "impact": 89},

        # 2. Airport
        {"category": "Airport", "name": "Kempegowda International Airport Bengaluru (BLR)", "lat": 13.1986, "lon": 77.7066, "address": "Devanahalli, Bengaluru", "impact": 95},
        {"category": "Airport", "name": "HAL Old Airport & Aerospace Facility", "lat": 12.9500, "lon": 77.6680, "address": "HAL Airport Road", "impact": 70},

        # 3. Bus Terminal
        {"category": "Bus Terminal", "name": "Kempegowda Bus Station (Majestic BMTC & KSRTC)", "lat": 12.9767, "lon": 77.5713, "address": "Subhash Nagar, Majestic", "impact": 97},
        {"category": "Bus Terminal", "name": "Shantinagar BMTC TTMC Bus Station", "lat": 12.9540, "lon": 77.5950, "address": "KH Road, Shantinagar", "impact": 88},
        {"category": "Bus Terminal", "name": "Banashankari BMTC TTMC Terminal", "lat": 12.9150, "lon": 77.5730, "address": "Kanakanagar, Banashankari", "impact": 86},
        {"category": "Bus Terminal", "name": "Domlur BMTC TTMC Traffic Transit Management Centre", "lat": 12.9610, "lon": 77.6390, "address": "Old Airport Road, Domlur", "impact": 82},
        {"category": "Bus Terminal", "name": "Kengeri Satellite Town Bus Terminal", "lat": 12.9180, "lon": 77.4850, "address": "Kengeri Satellite Town", "impact": 78},

        # 4. Mall
        {"category": "Mall", "name": "Phoenix Marketcity & VR Bengaluru", "lat": 12.9958, "lon": 77.6963, "address": "Whitefield Main Rd, Mahadevapura", "impact": 96},
        {"category": "Mall", "name": "Orion Mall @ Brigade Gateway", "lat": 13.0110, "lon": 77.5550, "address": "Dr Rajkumar Rd, Rajajinagar", "impact": 94},
        {"category": "Mall", "name": "Nexus Koramangala (The Forum Mall)", "lat": 12.9345, "lon": 77.6110, "address": "Hosur Road, Koramangala", "impact": 93},
        {"category": "Mall", "name": "Nexus Shantiniketan Mall", "lat": 12.9880, "lon": 77.7280, "address": "Thigalarapalya, Whitefield", "impact": 89},
        {"category": "Mall", "name": "Mantri Square Mall", "lat": 12.9918, "lon": 77.5710, "address": "Sampige Rd, Malleshwaram", "impact": 91},
        {"category": "Mall", "name": "Vega City Mall", "lat": 12.9080, "lon": 77.6010, "address": "Bannerghatta Main Rd", "impact": 87},
        {"category": "Mall", "name": "Forum South Bangalore (Konanakunte)", "lat": 12.8890, "lon": 77.5680, "address": "Kanakapura Rd, Konanakunte", "impact": 88},

        # 5. Cinema
        {"category": "Cinema", "name": "PVR Director's Cut & Gold Class — Forum Rex Walk", "lat": 12.9735, "lon": 77.6045, "address": "Brigade Road", "impact": 92},
        {"category": "Cinema", "name": "PVR Superplex @ Phoenix Marketcity", "lat": 12.9960, "lon": 77.6970, "address": "Whitefield Main Road", "impact": 90},
        {"category": "Cinema", "name": "INOX Megaplex @ Garuda Mall", "lat": 12.9700, "lon": 77.6100, "address": "Magrath Road", "impact": 88},
        {"category": "Cinema", "name": "Urvashi Digital 4K Theatre", "lat": 12.9570, "lon": 77.5860, "address": "Lalbagh Fort Road", "impact": 82},
        {"category": "Cinema", "name": "Cinepolis Multiplex @ Royal Meenakshi Mall", "lat": 12.8750, "lon": 77.5950, "address": "Bannerghatta Rd", "impact": 84},

        # 6. Auditorium
        {"category": "Auditorium", "name": "Chowdiah Memorial Hall", "lat": 13.0118, "lon": 77.5795, "address": "16th Cross, Malleshwaram", "impact": 87},
        {"category": "Auditorium", "name": "Ravindra Kalakshetra & Samsa Amphitheatre", "lat": 12.9640, "lon": 77.5855, "address": "JC Road, Sampangi Rama Nagar", "impact": 85},
        {"category": "Auditorium", "name": "Ranga Shankara Cultural Theatre", "lat": 12.9168, "lon": 77.5790, "address": "JP Nagar 2nd Phase", "impact": 88},
        {"category": "Auditorium", "name": "Dr. B.R. Ambedkar Bhavan Auditorium", "lat": 12.9900, "lon": 77.5920, "address": "Millers Road, Vasanth Nagar", "impact": 83},
        {"category": "Auditorium", "name": "St. John's Auditorium", "lat": 12.9320, "lon": 77.6200, "address": "Koramangala 3rd Block", "impact": 84},

        # 7. Famous Tourist Attraction
        {"category": "Tourist Attraction", "name": "Lalbagh Botanical Garden & Glass House", "lat": 12.9507, "lon": 77.5848, "address": "Mavalli, Bengaluru", "impact": 94},
        {"category": "Tourist Attraction", "name": "Cubbon Park & Sri Chamarajendra Park", "lat": 12.9763, "lon": 77.5929, "address": "Kasturba Road, Bengaluru", "impact": 93},
        {"category": "Tourist Attraction", "name": "Bengaluru Palace", "lat": 12.9988, "lon": 77.5921, "address": "Vasanth Nagar", "impact": 89},
        {"category": "Tourist Attraction", "name": "Vidhana Soudha & High Court of Karnataka", "lat": 12.9796, "lon": 77.5907, "address": "Dr Ambedkar Veedhi", "impact": 91},
        {"category": "Tourist Attraction", "name": "ISKCON Temple Bangalore (Sri Radha Krishna)", "lat": 13.0098, "lon": 77.5511, "address": "Hare Krishna Hill, Rajajinagar", "impact": 95},

        # 8. Landmark Restaurant Food Destination
        {"category": "Restaurant", "name": "Vidyarthi Bhavan (Iconic Dosa Landmark)", "lat": 12.9430, "lon": 77.5730, "address": "Gandhi Bazaar, Basavanagudi", "impact": 96},
        {"category": "Restaurant", "name": "MTR (Mavalli Tiffin Room) Lalbagh", "lat": 12.9550, "lon": 77.5860, "address": "Lalbagh Road", "impact": 95},
        {"category": "Restaurant", "name": "Truffles St. Marks Road / Koramangala", "lat": 12.9710, "lon": 77.6030, "address": "St. Marks Road", "impact": 92},
        {"category": "Restaurant", "name": "Meghana Foods Residency Road", "lat": 12.9730, "lon": 77.6060, "address": "Residency Road", "impact": 94},
        {"category": "Restaurant", "name": "Empire Restaurant Church Street", "lat": 12.9750, "lon": 77.6050, "address": "Church Street", "impact": 93}
    ]

    features = []
    for idx, item in enumerate(amenities, 1):
        features.append({
            "type": "Feature",
            "properties": {
                "amenity_id": f"INFRA_{idx:03d}",
                "category": item["category"],
                "name": item["name"],
                "address": item["address"],
                "daily_footfall_impact_score": item["impact"]
            },
            "geometry": Point(item["lon"], item["lat"])
        })

    gdf = gpd.GeoDataFrame.from_features(features, crs=GEO_CRS)
    out1 = "data/layers_geojson/layer8_infra_amenities.geojson"
    out2 = "frontend/public/data/layer8_infra_amenities.geojson"
    gdf.to_file(out1, driver="GeoJSON")
    gdf.to_file(out2, driver="GeoJSON")
    logger.info(f"Exported Layer 8 with {len(gdf)} Infrastructure & Amenity Points.")
    return len(gdf)

def build_layer9_road_traffic():
    logger.info("Generating Bonus Layer: Road Hierarchy & Evening Peak Traffic Congestion...")
    
    # Key arterial and commercial high streets in Bangalore
    corridors = [
        ("Indiranagar 100ft Road High Street", [(77.6410, 12.9640), (77.6415, 12.9720), (77.6420, 12.9810)], "Commercial High Street", 15.2, 88, 96),
        ("Koramangala 80ft Road & 100ft Ring", [(77.6200, 12.9280), (77.6245, 12.9352), (77.6320, 12.9420)], "Commercial High Street", 16.5, 84, 94),
        ("Outer Ring Road — Bellandur to Marathahalli", [(77.6650, 12.9150), (77.6762, 12.9260), (77.7011, 12.9562)], "Primary Arterial Expressway", 24.5, 92, 82),
        ("HSR Layout 27th Main Commercial Spine", [(77.6380, 12.9040), (77.6389, 12.9116), (77.6395, 12.9220)], "Commercial High Street", 18.0, 78, 92),
        ("Whitefield ITPL Main Road Corridor", [(77.7200, 12.9780), (77.7499, 12.9698), (77.7650, 12.9650)], "Primary Arterial Corridor", 22.0, 80, 89),
        ("Jayanagar 11th Main Heritage Corridor", [(77.5830, 12.9200), (77.5833, 12.9298), (77.5835, 12.9390)], "Commercial High Street", 19.5, 72, 90),
        ("Sampige Road Malleshwaram", [(77.5700, 12.9950), (77.5701, 13.0031), (77.5703, 13.0120)], "High Density Traditional Spine", 13.8, 94, 98),
        ("Brigade Road & Church Street Promenade", [(77.6080, 12.9690), (77.6075, 12.9738), (77.6060, 12.9755)], "Pedestrian & High Street", 10.5, 96, 99),
        ("Dr. Rajkumar Road Rajajinagar", [(77.5520, 12.9880), (77.5530, 12.9982), (77.5540, 13.0100)], "Primary Arterial Corridor", 23.0, 76, 86),
        ("Outer Ring Road — Hebbal Flyover & Gateway", [(77.5850, 13.0300), (77.5970, 13.0358), (77.6150, 13.0400)], "Primary Arterial Expressway", 28.0, 85, 80),
        ("Kalyan Nagar HRBR 80ft Road", [(77.6350, 13.0120), (77.6432, 13.0159), (77.6520, 13.0200)], "Commercial High Street", 19.0, 70, 91),
        ("Electronic City Phase 1 Elevated Corridor", [(77.6500, 12.8350), (77.6602, 12.8452), (77.6700, 12.8600)], "Expressway & Service Spine", 32.0, 68, 78)
    ]

    features = []
    for idx, (name, pts, hway_cls, speed, cong, vis) in enumerate(corridors, 1):
        line = LineString(pts)
        features.append({
            "type": "Feature",
            "properties": {
                "road_id": f"ROAD_{idx:02d}",
                "road_name": name,
                "highway_class": hway_cls,
                "evening_peak_speed_kmh": speed,
                "congestion_index": cong,
                "visibility_frontage_score": vis
            },
            "geometry": line
        })

    gdf = gpd.GeoDataFrame.from_features(features, crs=GEO_CRS)
    out1 = "data/layers_geojson/layer9_road_traffic_corridors.geojson"
    out2 = "frontend/public/data/layer9_road_traffic_corridors.geojson"
    gdf.to_file(out1, driver="GeoJSON")
    gdf.to_file(out2, driver="GeoJSON")
    logger.info(f"Exported Road Traffic Layer with {len(gdf)} corridor segments.")
    return len(gdf)

if __name__ == "__main__":
    build_layer7_business_zones()
    build_layer8_infra_amenities()
    build_layer9_road_traffic()
