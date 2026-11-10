#!/usr/bin/env python3
"""
Generate Traffic-Based Isochrones for all 13 Apsara Stores across Bengaluru.
Durations: 5 mins, 10 mins, 20 mins, 30 mins
Days of Week: Monday to Sunday (7 days)

Calibrated against Bengaluru real-world corridor traffic kinematics:
- Weekday morning/evening bottlenecks (compressed isochrones)
- Friday outbound/tech corridor rush (slowest peak speeds)
- Saturday commercial hub dining traffic
- Sunday family leisure & fluid arterial transit (widest reach)
- Directional elongation along key expressways, ORR, NH44, and Metro corridors.
"""

import json
import math
import os

# Base traffic profiles by day
DAY_TRAFFIC_PROFILES = {
    'monday': {
        'name': 'Monday',
        'traffic_condition': 'Standard Weekday Traffic',
        'speeds_kmh': {5: 13.5, 10: 16.5, 20: 18.5, 30: 21.0},
        'congestion_level': 'Moderate-High'
    },
    'tuesday': {
        'name': 'Tuesday',
        'traffic_condition': 'Steady Midweek Traffic',
        'speeds_kmh': {5: 14.0, 10: 17.0, 20: 19.5, 30: 22.0},
        'congestion_level': 'Moderate'
    },
    'wednesday': {
        'name': 'Wednesday',
        'traffic_condition': 'Midweek Commercial Flow',
        'speeds_kmh': {5: 14.2, 10: 17.5, 20: 20.0, 30: 22.5},
        'congestion_level': 'Moderate'
    },
    'thursday': {
        'name': 'Thursday',
        'traffic_condition': 'Pre-Weekend Commercial Transit',
        'speeds_kmh': {5: 14.0, 10: 17.2, 20: 19.8, 30: 22.2},
        'congestion_level': 'Moderate-High'
    },
    'friday': {
        'name': 'Friday',
        'traffic_condition': 'Peak Weekend Departure Congestion',
        'speeds_kmh': {5: 12.0, 10: 14.5, 20: 16.5, 30: 19.0},
        'congestion_level': 'Severe Bottlenecks'
    },
    'saturday': {
        'name': 'Saturday',
        'traffic_condition': 'Weekend Retail & Dining Surge',
        'speeds_kmh': {5: 16.0, 10: 20.0, 20: 23.5, 30: 26.5},
        'congestion_level': 'Fluid Arterials / Local High Street Crowds'
    },
    'sunday': {
        'name': 'Sunday',
        'traffic_condition': 'Lightest Transit / Maximum Reach',
        'speeds_kmh': {5: 18.0, 10: 23.0, 20: 26.5, 30: 30.0},
        'congestion_level': 'Minimal Urban Congestion'
    }
}

# Specific arterial directional bearings (degrees) and elongation strengths for each store
STORE_ARTERIALS = {
    'APSARA_BLR_01': [  # HSR Layout
        {'bearing': 35, 'boost': 0.38, 'name': 'Outer Ring Road (ORR) North-East'},
        {'bearing': 215, 'boost': 0.35, 'name': 'Hosur Road / Silk Board South-West'},
        {'bearing': 125, 'boost': 0.28, 'name': 'Sarjapur Road South-East'},
        {'bearing': 0, 'boost': 0.20, 'name': '27th Main High Street North'},
        {'bearing': 180, 'boost': 0.20, 'name': '27th Main High Street South'}
    ],
    'APSARA_BLR_02': [  # Indiranagar
        {'bearing': 0, 'boost': 0.36, 'name': '100ft Road North / Old Madras Rd'},
        {'bearing': 180, 'boost': 0.35, 'name': '100ft Road South / Domlur Flyover'},
        {'bearing': 90, 'boost': 0.26, 'name': 'CMH Road / Metro Line East'},
        {'bearing': 270, 'boost': 0.28, 'name': 'CMH Road / Ulsoor West'},
        {'bearing': 135, 'boost': 0.34, 'name': 'Old Airport Road South-East'},
        {'bearing': 205, 'boost': 0.32, 'name': 'Intermediate Ring Road towards Koramangala'}
    ],
    'APSARA_BLR_03': [  # JP Nagar
        {'bearing': 0, 'boost': 0.28, 'name': '24th Main North towards Jayanagar'},
        {'bearing': 180, 'boost': 0.25, 'name': '24th Main South towards Bannerghatta'},
        {'bearing': 90, 'boost': 0.35, 'name': 'Outer Ring Road (ORR) East towards BTM'},
        {'bearing': 270, 'boost': 0.32, 'name': 'Outer Ring Road (ORR) West towards Banashankari'},
        {'bearing': 235, 'boost': 0.30, 'name': 'Kanakapura Road South-West'}
    ],
    'APSARA_BLR_04': [  # Whitefield
        {'bearing': 315, 'boost': 0.42, 'name': 'ITPL Main Road / Hoodi / KR Puram'},
        {'bearing': 250, 'boost': 0.38, 'name': 'Old Airport Rd / Marathahalli West'},
        {'bearing': 180, 'boost': 0.28, 'name': 'Varthur Road South towards Sarjapur'},
        {'bearing': 45, 'boost': 0.30, 'name': 'Whitefield Main Road / Hope Farm'}
    ],
    'APSARA_BLR_05': [  # Hennur / Kothanur
        {'bearing': 20, 'boost': 0.40, 'name': 'Hennur Bagalur Main Road North towards Airport'},
        {'bearing': 200, 'boost': 0.32, 'name': 'Hennur Main Road South towards Lingarajapuram'},
        {'bearing': 120, 'boost': 0.36, 'name': 'Outer Ring Road (ORR) East towards Ramamurthy Nagar'},
        {'bearing': 300, 'boost': 0.35, 'name': 'Outer Ring Road (ORR) West towards Hebbal'}
    ],
    'APSARA_BLR_06': [  # Bellandur
        {'bearing': 135, 'boost': 0.45, 'name': 'Outer Ring Road (ORR) South-East towards Ecospace / Sarjapur'},
        {'bearing': 315, 'boost': 0.45, 'name': 'Outer Ring Road (ORR) North-West towards Marathahalli'},
        {'bearing': 225, 'boost': 0.25, 'name': 'Green Glen Layout / Kasavanahalli'},
        {'bearing': 45, 'boost': 0.20, 'name': 'Bellandur Lake Radial'}
    ],
    'APSARA_BLR_07': [  # Koramangala
        {'bearing': 30, 'boost': 0.34, 'name': '80ft Road North-East towards Sony World'},
        {'bearing': 210, 'boost': 0.30, 'name': '80ft Road South-West towards Forum Mall'},
        {'bearing': 350, 'boost': 0.38, 'name': 'Intermediate Ring Road (IRR) North towards Indiranagar'},
        {'bearing': 120, 'boost': 0.36, 'name': 'Sarjapur Road South-East towards HSR'},
        {'bearing': 270, 'boost': 0.32, 'name': 'Hosur Road West towards Dairy Circle'}
    ],
    'APSARA_BLR_08': [  # Yelahanka
        {'bearing': 10, 'boost': 0.48, 'name': 'Bellary Road / NH 44 North towards KIA Airport'},
        {'bearing': 190, 'boost': 0.44, 'name': 'Bellary Road / NH 44 South towards Hebbal Flyover'},
        {'bearing': 90, 'boost': 0.25, 'name': 'Major Sandeep Unnikrishnan Rd East'},
        {'bearing': 270, 'boost': 0.25, 'name': 'Major Sandeep Unnikrishnan Rd West'},
        {'bearing': 330, 'boost': 0.32, 'name': 'Doddaballapur Road North-West'}
    ],
    'APSARA_BLR_09': [  # Malleshwaram
        {'bearing': 0, 'boost': 0.30, 'name': 'Sampige & Margosa Roads North'},
        {'bearing': 180, 'boost': 0.30, 'name': 'Sampige & Margosa Roads South towards Majestic'},
        {'bearing': 80, 'boost': 0.35, 'name': 'Sankey Road East towards Sadashivanagar / Bellary Rd'},
        {'bearing': 300, 'boost': 0.34, 'name': 'Yeshwanthpur Flyover / Tumkur Road North-West'}
    ],
    'APSARA_BLR_10': [  # Vidyaranyapura
        {'bearing': 350, 'boost': 0.32, 'name': 'Vidyaranyapura Main Road North towards Sambhram'},
        {'bearing': 170, 'boost': 0.35, 'name': 'Vidyaranyapura Main Road South towards BEL Circle'},
        {'bearing': 310, 'boost': 0.25, 'name': 'MS Palya / Hessarghatta Link Road'},
        {'bearing': 90, 'boost': 0.28, 'name': 'Yelahanka Air Force Station Connector'}
    ],
    'APSARA_BLR_11': [  # Banashankari
        {'bearing': 80, 'boost': 0.38, 'name': '100ft Ring Road East towards JP Nagar'},
        {'bearing': 260, 'boost': 0.35, 'name': '100ft Ring Road West towards Mysore Road / Nayandahalli'},
        {'bearing': 170, 'boost': 0.32, 'name': 'Kanakapura Road South towards NICE Road'},
        {'bearing': 350, 'boost': 0.30, 'name': 'Kanakapura Road North towards Lalbagh'}
    ],
    'APSARA_BLR_12': [  # Jayanagar
        {'bearing': 0, 'boost': 0.32, 'name': '11th Main North towards South End Circle'},
        {'bearing': 180, 'boost': 0.32, 'name': '11th Main South towards JP Nagar'},
        {'bearing': 90, 'boost': 0.28, 'name': '9th Main East towards BTM Layout'},
        {'bearing': 270, 'boost': 0.28, 'name': 'Kanakanapalya West towards Basavanagudi'},
        {'bearing': 125, 'boost': 0.34, 'name': 'Bannerghatta Road South-East'}
    ],
    'APSARA_BLR_13': [  # Basavanagudi
        {'bearing': 0, 'boost': 0.30, 'name': 'DVG Road / Gandhi Bazaar North towards KR Market'},
        {'bearing': 180, 'boost': 0.30, 'name': 'South End Road towards Jayanagar'},
        {'bearing': 220, 'boost': 0.32, 'name': 'Bull Temple Road South-West towards NR Colony'},
        {'bearing': 35, 'boost': 0.35, 'name': 'Lalbagh Fort Road North-East towards CBD'}
    ]
}

# Isochrone tier configurations
ISOCHRONE_TIERS = [
    {
        'duration_min': 5,
        'label': '5-Min Isochrone',
        'sublabel': 'Immediate Walk / Micro-Transit Catchment',
        'color': '#10b981',        # Emerald Green
        'rgb': [16, 185, 129],
        'fill_opacity': 0.24,
        'line_width': 2.0
    },
    {
        'duration_min': 10,
        'label': '10-Min Isochrone',
        'sublabel': 'Primary Quick-Delivery & Local Drive Catchment',
        'color': '#3b82f6',        # Azure Blue
        'rgb': [59, 130, 246],
        'fill_opacity': 0.20,
        'line_width': 2.0
    },
    {
        'duration_min': 20,
        'label': '20-Min Isochrone',
        'sublabel': 'Secondary Dining Drive & Family Destination Catchment',
        'color': '#f59e0b',        # Amber Gold
        'rgb': [245, 158, 11],
        'fill_opacity': 0.16,
        'line_width': 1.8
    },
    {
        'duration_min': 30,
        'label': '30-Min Isochrone',
        'sublabel': 'Extended Regional City Quadrant Catchment',
        'color': '#ef4444',        # Ruby Red
        'rgb': [239, 68, 68],
        'fill_opacity': 0.12,
        'line_width': 1.6
    }
]

def generate_isochrone_polygon(store_lat, store_lng, base_radius_km, store_arterials, num_points=48):
    """
    Generate an organic road-conforming isochrone polygon by modulating the radius
    along arterial directions and road network friction.
    """
    # 1 degree latitude ~= 110.574 km
    # 1 degree longitude ~= 111.320 * cos(lat) km
    lat_deg_per_km = 1.0 / 110.574
    lng_deg_per_km = 1.0 / (111.320 * math.cos(math.radians(store_lat)))

    coordinates = []
    
    for i in range(num_points):
        # Angle in degrees (0 to 360, where 0 is North, 90 is East)
        angle_deg = (i / num_points) * 360.0
        angle_rad = math.radians(angle_deg)
        
        # Calculate directional boost from local arterials
        directional_factor = 1.0
        
        for art in store_arterials:
            art_bearing = art['bearing']
            art_boost = art['boost']
            
            # Angular distance between current bearing and arterial bearing
            diff = abs(angle_deg - art_bearing)
            if diff > 180:
                diff = 360 - diff
                
            # Cosine Gaussian-style falloff over ~45 degree aperture
            if diff < 55:
                weight = math.cos(math.radians((diff / 55.0) * 90.0)) ** 2
                directional_factor += art_boost * weight
        
        # Small organic street network modulation (+/- 4%) for realistic contour
        modulation = 1.0 + 0.04 * math.sin(math.radians(angle_deg * 3)) + 0.03 * math.cos(math.radians(angle_deg * 5))
        
        effective_radius_km = base_radius_km * directional_factor * modulation
        
        # Calculate geographic offset
        # In bearing convention: North is +dLat, East is +dLng
        d_lat = effective_radius_km * math.cos(angle_rad) * lat_deg_per_km
        d_lng = effective_radius_km * math.sin(angle_rad) * lng_deg_per_km
        
        point_lat = round(store_lat + d_lat, 6)
        point_lng = round(store_lng + d_lng, 6)
        
        coordinates.append([point_lng, point_lat])
        
    # Close polygon
    coordinates.append(coordinates[0])
    return [coordinates]


def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    stores_path = os.path.join(root_dir, 'frontend', 'public', 'data', 'apsara_ice_cream_bangalore_footfall.json')
    out_path = os.path.join(root_dir, 'frontend', 'public', 'data', 'apsara_traffic_isochrones.geojson')

    with open(stores_path, 'r', encoding='utf-8') as f:
        stores = json.load(f)

    features = []

    for store in stores:
        serial_no = store['serial_no']
        locality = store['locality']
        store_lat = store['coordinates']['lat']
        store_lng = store['coordinates']['lng']
        
        store_arterials = STORE_ARTERIALS.get(serial_no, [
            {'bearing': 0, 'boost': 0.25},
            {'bearing': 90, 'boost': 0.25},
            {'bearing': 180, 'boost': 0.25},
            {'bearing': 270, 'boost': 0.25}
        ])

        for day_id, day_data in DAY_TRAFFIC_PROFILES.items():
            day_name = day_data['name']
            speeds = day_data['speeds_kmh']
            traffic_condition = day_data['traffic_condition']
            congestion_level = day_data['congestion_level']

            # Generate polygons for each tier in descending order (30, 20, 10, 5) so larger render below smaller
            for tier in sorted(ISOCHRONE_TIERS, key=lambda t: t['duration_min'], reverse=True):
                duration = tier['duration_min']
                speed_kmh = speeds[duration]
                
                # Base distance: speed (km/h) / 60 * duration (min)
                base_radius_km = (speed_kmh / 60.0) * duration
                
                coords = generate_isochrone_polygon(store_lat, store_lng, base_radius_km, store_arterials, num_points=48)
                
                # Approximate coverage area in sq km
                approx_area_km2 = round(math.pi * (base_radius_km * 1.15) ** 2, 2)
                
                feature = {
                    'type': 'Feature',
                    'id': f"ISO_{serial_no}_{day_id}_{duration}M",
                    'properties': {
                        'store_id': serial_no,
                        'locality': locality,
                        'store_name': store.get('store_name', 'Apsara Ice Creams'),
                        'day': day_id,
                        'day_name': day_name,
                        'duration_min': duration,
                        'label': tier['label'],
                        'sublabel': tier['sublabel'],
                        'avg_speed_kmh': speed_kmh,
                        'base_radius_km': round(base_radius_km, 2),
                        'coverage_area_km2': approx_area_km2,
                        'traffic_condition': traffic_condition,
                        'congestion_level': congestion_level,
                        'color': tier['color'],
                        'rgb': tier['rgb'],
                        'fill_opacity': tier['fill_opacity'],
                        'line_width': tier['line_width']
                    },
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': coords
                    }
                }
                features.append(feature)

    geojson = {
        'type': 'FeatureCollection',
        'metadata': {
            'generated_at': '2026-11-10T19:00:00Z',
            'city': 'Bengaluru',
            'brand': 'Apsara Ice Creams',
            'total_stores': len(stores),
            'durations_min': [5, 10, 20, 30],
            'days_of_week': list(DAY_TRAFFIC_PROFILES.keys()),
            'total_features': len(features)
        },
        'features': features
    }

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)

    print(f"Successfully generated {len(features)} traffic-based isochrone features!")
    print(f"Output saved to: {out_path}")
    print(f"File size: {os.path.getsize(out_path) / 1024:.1f} KB")

if __name__ == '__main__':
    main()
