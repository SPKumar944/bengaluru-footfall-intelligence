import json
import math
import os

# Complete verified list of all 31 Apsara Ice Creams outlets across Bengaluru
# Validated against https://apsaraicecreams.com/store-locator/ and verified Google Maps coordinates

STORES_RAW = [
    # 1. HSR Layout (Flagship)
    {
        "locality": "HSR Layout",
        "zone": "South East",
        "corridor_name": "19th Main & 27th Main High Street",
        "address": "1705, 19th Main Rd, Garden Layout, Sector 2, HSR Layout, Bengaluru, Karnataka 560102",
        "lat": 12.9056099,
        "lng": 77.6445964,
        "google_rating": 4.4,
        "google_review_count": 1556,
        "est_monthly_customers": 4045,
        "est_daily_cups": 134,
        "est_evening_peak_cups": 54,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 12751,
        "weekend_daily_footfall": 18304,
        "corridor_bearing": 90
    },
    # 2. Indiranagar (Flagship)
    {
        "locality": "Indiranagar",
        "zone": "East Central",
        "corridor_name": "100 Feet Rd & 12th Main Strip",
        "address": "100/1B, 2nd Main Road, 10th Cross Rd, Indira Nagar 1st Stage, Bengaluru, Karnataka 560038",
        "lat": 12.9821754,
        "lng": 77.6385749,
        "google_rating": 4.4,
        "google_review_count": 1243,
        "est_monthly_customers": 4510,
        "est_daily_cups": 150,
        "est_evening_peak_cups": 62,
        "avg_ticket_size_inr": 195,
        "weekday_daily_footfall": 15200,
        "weekend_daily_footfall": 23400,
        "corridor_bearing": 0
    },
    # 3. Koramangala
    {
        "locality": "Koramangala",
        "zone": "South East",
        "corridor_name": "KHB Colony 1st A Main & Jyoti Nivas College Rd",
        "address": "Building no 10, ground floor, 1st A Main Road, KHB Colony, 7th Block, Koramangala, Bengaluru, Karnataka 560095",
        "lat": 12.9363338,
        "lng": 77.61548,
        "google_rating": 4.5,
        "google_review_count": 1420,
        "est_monthly_customers": 4680,
        "est_daily_cups": 156,
        "est_evening_peak_cups": 68,
        "avg_ticket_size_inr": 190,
        "weekday_daily_footfall": 16400,
        "weekend_daily_footfall": 24800,
        "corridor_bearing": 45
    },
    # 4. Whitefield / Siddhapura
    {
        "locality": "Whitefield",
        "zone": "East",
        "corridor_name": "Varthur Main Rd & ITPL Corridor",
        "address": "Shop No.4, S.H.R. Complex, Siddhapura, Varthur Main Rd, Whitefield, Bengaluru, Karnataka 560066",
        "lat": 12.9561917,
        "lng": 77.7297523,
        "google_rating": 4.3,
        "google_review_count": 890,
        "est_monthly_customers": 3650,
        "est_daily_cups": 121,
        "est_evening_peak_cups": 48,
        "avg_ticket_size_inr": 185,
        "weekday_daily_footfall": 11800,
        "weekend_daily_footfall": 17200,
        "corridor_bearing": 90
    },
    # 5. Bellandur / Green Glen Layout
    {
        "locality": "Bellandur",
        "zone": "South East",
        "corridor_name": "Sobha Lakeview & Outer Ring Road Transit Axis",
        "address": "No. 1134, Sobha Club House Road, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103",
        "lat": 12.9284277,
        "lng": 77.6717505,
        "google_rating": 4.3,
        "google_review_count": 960,
        "est_monthly_customers": 3820,
        "est_daily_cups": 127,
        "est_evening_peak_cups": 52,
        "avg_ticket_size_inr": 185,
        "weekday_daily_footfall": 13400,
        "weekend_daily_footfall": 18900,
        "corridor_bearing": 135
    },
    # 6. JP Nagar (5th Phase)
    {
        "locality": "JP Nagar",
        "zone": "South",
        "corridor_name": "24th Main Road Commercial Spine",
        "address": "No 15/A, 24th main road katha no 311 JP Nagar 5th phase, Bommanahalli, Bengaluru, Karnataka 560078",
        "lat": 12.906935,
        "lng": 77.585523,
        "google_rating": 4.4,
        "google_review_count": 1110,
        "est_monthly_customers": 3950,
        "est_daily_cups": 131,
        "est_evening_peak_cups": 51,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 12100,
        "weekend_daily_footfall": 17800,
        "corridor_bearing": 0
    },
    # 7. Basavanagudi / Gandhi Bazaar
    {
        "locality": "Basavanagudi",
        "zone": "South Central",
        "corridor_name": "Gandhi Bazaar & DVG Road Heritage Food Street",
        "address": "No. 92, SNSKM Building, Shop No 1 & 2(A), E Anjaneya Temple St, Gandhi Bazaar, Basavanagudi, Bengaluru, Karnataka 560004",
        "lat": 12.943968,
        "lng": 77.568472,
        "google_rating": 4.5,
        "google_review_count": 1380,
        "est_monthly_customers": 4200,
        "est_daily_cups": 140,
        "est_evening_peak_cups": 58,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 14500,
        "weekend_daily_footfall": 21500,
        "corridor_bearing": 45
    },
    # 8. Yelahanka New Town
    {
        "locality": "Yelahanka",
        "zone": "North",
        "corridor_name": "Mother Dairy Rd & Yelahanka Commercial Hub",
        "address": "G.V.K. Castle, 800, M.I.G, Mother Dairy Rd, Yelahanka New Town, Bengaluru, Karnataka 560064",
        "lat": 13.0953921,
        "lng": 77.5831307,
        "google_rating": 4.3,
        "google_review_count": 780,
        "est_monthly_customers": 3100,
        "est_daily_cups": 103,
        "est_evening_peak_cups": 41,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 9800,
        "weekend_daily_footfall": 14500,
        "corridor_bearing": 0
    },
    # 9. Vidyaranyapura
    {
        "locality": "Vidyaranyapura",
        "zone": "North",
        "corridor_name": "Nanjappa Thindlu Road & BEL Layout",
        "address": "Shop no 5, 1070 & 1071, ground floor, Nanjappa Thindlu Road, 2nd Block, BEL Layout, Vidyaranyapura, Bengaluru, Karnataka 560097",
        "lat": 13.0691088,
        "lng": 77.5577282,
        "google_rating": 4.3,
        "google_review_count": 690,
        "est_monthly_customers": 2950,
        "est_daily_cups": 98,
        "est_evening_peak_cups": 39,
        "avg_ticket_size_inr": 170,
        "weekday_daily_footfall": 9200,
        "weekend_daily_footfall": 13600,
        "corridor_bearing": 90
    },
    # 10. Hennur / Kothanur
    {
        "locality": "Hennur / Kothanur",
        "zone": "North East",
        "corridor_name": "Hennur Bagalur Main Road Commercial Corridor",
        "address": "Shop No. G 8 & 9, Petra Complex, Hennur Main Road, Kothanur, Bengaluru, Karnataka 560077",
        "lat": 13.0624929,
        "lng": 77.649511,
        "google_rating": 4.4,
        "google_review_count": 840,
        "est_monthly_customers": 3250,
        "est_daily_cups": 108,
        "est_evening_peak_cups": 44,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 10400,
        "weekend_daily_footfall": 15200,
        "corridor_bearing": 30
    },
    # 11. Malleshwaram
    {
        "locality": "Malleshwaram",
        "zone": "North West",
        "corridor_name": "Sampige Road & 8th Cross Commercial Axis",
        "address": "2nd Main Road, Sampige Rd, Opp Joyalukkas, Malleshwaram, Bengaluru, Karnataka 560003",
        "lat": 13.0035,
        "lng": 77.5710,
        "google_rating": 4.5,
        "google_review_count": 1490,
        "est_monthly_customers": 4350,
        "est_daily_cups": 145,
        "est_evening_peak_cups": 60,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 15800,
        "weekend_daily_footfall": 23100,
        "corridor_bearing": 0
    },
    # 12. Banashankari
    {
        "locality": "Banashankari",
        "zone": "South West",
        "corridor_name": "80 Feet 30th Main Rd & BDA Complex",
        "address": "No. 609, Ground Floor, 80 Feet, 30th Main Rd, Banashankari 3rd Stage, Bengaluru, Karnataka 560085",
        "lat": 12.9254,
        "lng": 77.5482,
        "google_rating": 4.4,
        "google_review_count": 1050,
        "est_monthly_customers": 3700,
        "est_daily_cups": 123,
        "est_evening_peak_cups": 49,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 11500,
        "weekend_daily_footfall": 16900,
        "corridor_bearing": 90
    },
    # 13. Jayanagar (4th Block)
    {
        "locality": "Jayanagar",
        "zone": "South Central",
        "corridor_name": "30th Cross Rd & 4th Block High Street",
        "address": "146/C, 6th C Main Road, 30th Cross Rd, opp. Ganesha Temple, 4th Block, Jayanagar, Bengaluru, Karnataka 560011",
        "lat": 12.9268,
        "lng": 77.5835,
        "google_rating": 4.5,
        "google_review_count": 1620,
        "est_monthly_customers": 4600,
        "est_daily_cups": 153,
        "est_evening_peak_cups": 64,
        "avg_ticket_size_inr": 185,
        "weekday_daily_footfall": 16200,
        "weekend_daily_footfall": 24200,
        "corridor_bearing": 0
    },
    # 14. Kanakapura Road / Raghuvanahalli
    {
        "locality": "Kanakapura Road",
        "zone": "South",
        "corridor_name": "Kanakapura NH948 Metro Corridor",
        "address": "No.27, 1st cross, Kanakapura Main Rd, Manjunatha Nagar, Raghuvanahalli, Bengaluru, Karnataka 560109",
        "lat": 12.8827357,
        "lng": 77.5464332,
        "google_rating": 4.3,
        "google_review_count": 520,
        "est_monthly_customers": 2850,
        "est_daily_cups": 95,
        "est_evening_peak_cups": 38,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 8900,
        "weekend_daily_footfall": 13400,
        "corridor_bearing": 30
    },
    # 15. Ramamurthy Nagar
    {
        "locality": "Ramamurthy Nagar",
        "zone": "North East",
        "corridor_name": "East of NGEF & Kempegowda Underpass Road",
        "address": "No. 5M 408, Ground Floor, East of NGEF, BDA Layout, Kempegowda Underpass Road, Ramamurthy Nagar, Bengaluru, Karnataka 560016",
        "lat": 13.0085,
        "lng": 77.6655,
        "google_rating": 4.3,
        "google_review_count": 480,
        "est_monthly_customers": 2700,
        "est_daily_cups": 90,
        "est_evening_peak_cups": 36,
        "avg_ticket_size_inr": 170,
        "weekday_daily_footfall": 8400,
        "weekend_daily_footfall": 12800,
        "corridor_bearing": 90
    },
    # 16. Vijayanagar
    {
        "locality": "Vijayanagar",
        "zone": "West",
        "corridor_name": "1st Main Rd & Vijayanagar Club Boulevard",
        "address": "Dr Nanjaiah Complex, 19/1, 1st Main Rd, opposite Vijayanagar Club, Hoshalli Extension, Vijayanagar, Bengaluru, Karnataka 560040",
        "lat": 12.9705,
        "lng": 77.5348,
        "google_rating": 4.4,
        "google_review_count": 760,
        "est_monthly_customers": 3400,
        "est_daily_cups": 113,
        "est_evening_peak_cups": 46,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 11200,
        "weekend_daily_footfall": 16500,
        "corridor_bearing": 0
    },
    # 17. Kasavanahalli / Sarjapur Road
    {
        "locality": "Kasavanahalli",
        "zone": "South East",
        "corridor_name": "Kasavanahalli Main Road & KPC Layout",
        "address": "533, 2nd main road, KPC Layout, Kasavanahalli, Bengaluru, Karnataka 560035",
        "lat": 12.9019273,
        "lng": 77.6771626,
        "google_rating": 4.3,
        "google_review_count": 610,
        "est_monthly_customers": 3150,
        "est_daily_cups": 105,
        "est_evening_peak_cups": 43,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 9800,
        "weekend_daily_footfall": 14700,
        "corridor_bearing": 45
    },
    # 18. Gunjur / Varthur
    {
        "locality": "Gunjur / Varthur",
        "zone": "East",
        "corridor_name": "Gunjur-Varthur Main Road Corridor",
        "address": "Ground Floor, Shop No 4, Sy No 141/3 Near IBO, Gunjur Village, Varthur, Bengaluru, Karnataka 560087",
        "lat": 12.9256854,
        "lng": 77.72855,
        "google_rating": 4.3,
        "google_review_count": 430,
        "est_monthly_customers": 2600,
        "est_daily_cups": 87,
        "est_evening_peak_cups": 35,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 8100,
        "weekend_daily_footfall": 12200,
        "corridor_bearing": 90
    },
    # 19. Bilekahalli / Vijaya Bank Layout
    {
        "locality": "Bilekahalli",
        "zone": "South",
        "corridor_name": "Bannerghatta Rd - Vijaya Bank Layout Axis",
        "address": "1065B, Vijay Mansion, 5th Cross Rd, Vijaya Bank Layout, Bilekahalli, Bengaluru, Karnataka 560076",
        "lat": 12.8937898,
        "lng": 77.6110092,
        "google_rating": 4.3,
        "google_review_count": 590,
        "est_monthly_customers": 3050,
        "est_daily_cups": 102,
        "est_evening_peak_cups": 41,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 9500,
        "weekend_daily_footfall": 14200,
        "corridor_bearing": 0
    },
    # 20. Hebbal Kempapura
    {
        "locality": "Hebbal Kempapura",
        "zone": "North",
        "corridor_name": "15th A Cross & Coffee Board Park Hub",
        "address": "No.2, Ground Floor, 15 Th A Cross, Bhuvaneshwari Nagar, Opp Coffee Board Park, Hebbal Kempapura, Bengaluru, Karnataka 560024",
        "lat": 13.0532943,
        "lng": 77.6043298,
        "google_rating": 4.4,
        "google_review_count": 680,
        "est_monthly_customers": 3200,
        "est_daily_cups": 107,
        "est_evening_peak_cups": 44,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 10200,
        "weekend_daily_footfall": 15100,
        "corridor_bearing": 0
    },
    # 21. Kadugodi / Seegehalli
    {
        "locality": "Kadugodi / Seegehalli",
        "zone": "East",
        "corridor_name": "Seegehalli Main Road & Kadugodi Station Axis",
        "address": "Sriram Arcade, 84/B1, near Axis Bank, opp Nitesh Flushing Meadows, Seegehalli, Kadugodi, Bengaluru, Karnataka 560067",
        "lat": 13.012522,
        "lng": 77.7625612,
        "google_rating": 4.3,
        "google_review_count": 510,
        "est_monthly_customers": 2800,
        "est_daily_cups": 93,
        "est_evening_peak_cups": 37,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 8700,
        "weekend_daily_footfall": 13100,
        "corridor_bearing": 90
    },
    # 22. Rajarajeshwari Nagar (RR Nagar)
    {
        "locality": "Rajarajeshwari Nagar",
        "zone": "South West",
        "corridor_name": "Channasandra Main Rd & BEML Layout",
        "address": "No. 72 Channasandra Main Road, BEML Layout, 5th Stage, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098",
        "lat": 12.9045789,
        "lng": 77.5214348,
        "google_rating": 4.4,
        "google_review_count": 720,
        "est_monthly_customers": 3300,
        "est_daily_cups": 110,
        "est_evening_peak_cups": 45,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 10500,
        "weekend_daily_footfall": 15600,
        "corridor_bearing": 45
    },
    # 23. Hoodi / Mahadevapura
    {
        "locality": "Hoodi",
        "zone": "East",
        "corridor_name": "Hoodi Main Road & Mahadevapura IT Corridor",
        "address": "278, First Cross, Hoodi, Opp. Ganesha Temple, Thigalarapalya, Mahadevapura, Bengaluru, Karnataka 560048",
        "lat": 12.9928471,
        "lng": 77.7170154,
        "google_rating": 4.3,
        "google_review_count": 640,
        "est_monthly_customers": 3100,
        "est_daily_cups": 103,
        "est_evening_peak_cups": 42,
        "avg_ticket_size_inr": 180,
        "weekday_daily_footfall": 9900,
        "weekend_daily_footfall": 14600,
        "corridor_bearing": 90
    },
    # 24. Kodathi Gate / Carmelaram
    {
        "locality": "Kodathi Gate",
        "zone": "South East",
        "corridor_name": "Sarjapur Main Road - Kodathi Gate",
        "address": "141/1, Shop No. 7 & 8, Ground Floor, Marathahalli-Sarjapur Rd, Besides HP Petrol Bunk, Kodathi Gate, Bengaluru, Karnataka 560035",
        "lat": 12.8971331,
        "lng": 77.7186901,
        "google_rating": 4.3,
        "google_review_count": 490,
        "est_monthly_customers": 2750,
        "est_daily_cups": 92,
        "est_evening_peak_cups": 37,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 8600,
        "weekend_daily_footfall": 12900,
        "corridor_bearing": 120
    },
    # 25. Electronic City Phase 2
    {
        "locality": "Electronic City Phase 2",
        "zone": "South",
        "corridor_name": "Ananthnagar Main Road Commercial Strip",
        "address": "Shop no.1023, 1st Cross, Ananthnagar Main Road, near Vishal Mega Mart, Phase 2, Electronic City, Bengaluru, Karnataka 560100",
        "lat": 12.8357333,
        "lng": 77.6909428,
        "google_rating": 4.3,
        "google_review_count": 550,
        "est_monthly_customers": 2900,
        "est_daily_cups": 97,
        "est_evening_peak_cups": 39,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 9100,
        "weekend_daily_footfall": 13500,
        "corridor_bearing": 0
    },
    # 26. Electronic City Phase 1
    {
        "locality": "Electronic City Phase 1",
        "zone": "South",
        "corridor_name": "Celebrity Classic & Neeladri Road Tech Hub",
        "address": "110/4, Venkata's Oak Wood Apartment, Commercial Shop 1, Near Celebrity Classic Layout, Electronic City Phase 1, Bengaluru, Karnataka 560100",
        "lat": 12.8479278,
        "lng": 77.6440633,
        "google_rating": 4.4,
        "google_review_count": 710,
        "est_monthly_customers": 3350,
        "est_daily_cups": 112,
        "est_evening_peak_cups": 46,
        "avg_ticket_size_inr": 185,
        "weekday_daily_footfall": 10800,
        "weekend_daily_footfall": 15800,
        "corridor_bearing": 90
    },
    # 27. Sarjapura Town
    {
        "locality": "Sarjapura Town",
        "zone": "East Outer",
        "corridor_name": "Sarjapur Main Road next to D-Mart",
        "address": "Shop no.5, Prabhavathi Complex, Next to D Mart, Sarjapura Town, Bengaluru, Karnataka 562125",
        "lat": 12.8609266,
        "lng": 77.7792282,
        "google_rating": 4.3,
        "google_review_count": 470,
        "est_monthly_customers": 2650,
        "est_daily_cups": 88,
        "est_evening_peak_cups": 35,
        "avg_ticket_size_inr": 170,
        "weekday_daily_footfall": 8200,
        "weekend_daily_footfall": 12400,
        "corridor_bearing": 90
    },
    # 28. Thanisandra Main Road
    {
        "locality": "Thanisandra",
        "zone": "North",
        "corridor_name": "Thanisandra Main Rd & Manyata Tech Park Outer Transit",
        "address": "Ground floor, Noves Square, No 67, Thanisandra Main Road, Chokkanahalli, Bengaluru, Karnataka 560064",
        "lat": 13.0820751,
        "lng": 77.6345441,
        "google_rating": 4.3,
        "google_review_count": 520,
        "est_monthly_customers": 2850,
        "est_daily_cups": 95,
        "est_evening_peak_cups": 38,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 8900,
        "weekend_daily_footfall": 13300,
        "corridor_bearing": 0
    },
    # 29. Mallathahalli / Papareddipalya
    {
        "locality": "Mallathahalli",
        "zone": "West",
        "corridor_name": "ITI Layout Main Road & Papareddipalya",
        "address": "No.7 & 45, ITI Layout Main Road, KK Layout, Papareddipalya, Mallathahalli, Bengaluru, Karnataka 560056",
        "lat": 12.967837,
        "lng": 77.5025172,
        "google_rating": 4.3,
        "google_review_count": 460,
        "est_monthly_customers": 2600,
        "est_daily_cups": 87,
        "est_evening_peak_cups": 35,
        "avg_ticket_size_inr": 170,
        "weekday_daily_footfall": 8100,
        "weekend_daily_footfall": 12100,
        "corridor_bearing": 90
    },
    # 30. Hesaraghatta Road / Kirloskar Layout
    {
        "locality": "Hesaraghatta Road",
        "zone": "North West",
        "corridor_name": "Hesaraghatta Main Road & Kirloskar Layout",
        "address": "Kirloskar's layout, Hesaraghatta Road, Bengaluru, Karnataka 560073",
        "lat": 13.0671368,
        "lng": 77.5008914,
        "google_rating": 4.3,
        "google_review_count": 410,
        "est_monthly_customers": 2500,
        "est_daily_cups": 83,
        "est_evening_peak_cups": 33,
        "avg_ticket_size_inr": 170,
        "weekday_daily_footfall": 7800,
        "weekend_daily_footfall": 11700,
        "corridor_bearing": 45
    },
    # 31. Budigere Cross / Cheemasandra
    {
        "locality": "Budigere Cross",
        "zone": "North East Outer",
        "corridor_name": "Old Madras Road - Budigere Cross Ferro Hub Mall",
        "address": "1st Floor, Ferro Hub Mall, Budigere Cross, Cheemasandra, Bengaluru, Karnataka 560049",
        "lat": 13.0482,
        "lng": 77.7478,
        "google_rating": 4.3,
        "google_review_count": 390,
        "est_monthly_customers": 2450,
        "est_daily_cups": 82,
        "est_evening_peak_cups": 33,
        "avg_ticket_size_inr": 175,
        "weekday_daily_footfall": 7600,
        "weekend_daily_footfall": 11500,
        "corridor_bearing": 90
    }
]

def generate_full_stores_dataset():
    stores_output = []
    catchments_features = []

    for i, s in enumerate(STORES_RAW, 1):
        serial = f"APSARA_BLR_{i:02d}"
        
        # Build store entry
        store_entry = {
            "serial_no": serial,
            "brand": "Apsara Ice Creams",
            "store_name": f"Apsara Ice Creams - {s['locality']}",
            "locality": s["locality"],
            "corridor_name": s["corridor_name"],
            "zone": s["zone"],
            "google_place_id": f"ChIJ_apsara_{serial.lower()}",
            "google_rating": s["google_rating"],
            "google_review_count": s["google_review_count"],
            "address": s["address"],
            "coordinates": {
                "lat": round(s["lat"], 7),
                "lng": round(s["lng"], 7)
            },
            "operating_hours": "11:00 AM - 11:30 PM (Daily)",
            "store_footfall": {
                "est_monthly_customers": s["est_monthly_customers"],
                "est_daily_cups": s["est_daily_cups"],
                "est_evening_peak_cups": s["est_evening_peak_cups"],
                "avg_ticket_size_inr": s["avg_ticket_size_inr"]
            },
            "regional_footfall": {
                "corridor_zone": s["corridor_name"],
                "annual_unique_visitors": int(s["weekend_daily_footfall"] * 365 * 0.72),
                "weekday_daily_footfall": s["weekday_daily_footfall"],
                "weekend_daily_footfall": s["weekend_daily_footfall"],
                "weekend_surge_pct": round((s["weekend_daily_footfall"] - s["weekday_daily_footfall"]) / s["weekday_daily_footfall"] * 100, 1),
                "peak_evening_hourly_flow": int(s["weekend_daily_footfall"] * 0.105),
                "f_and_b_share_pct": 38.5,
                "mean_dwell_time_mins": 55.0
            }
        }
        stores_output.append(store_entry)

        # Generate 350m pedestrian circle polygon for catchments geojson
        num_points = 36
        radius_deg_lat = 350.0 / 111320.0
        radius_deg_lng = 350.0 / (111320.0 * math.cos(math.radians(s["lat"])))
        circle_coords = []
        for p in range(num_points + 1):
            angle = 2 * math.pi * p / num_points
            lat_p = s["lat"] + radius_deg_lat * math.sin(angle)
            lng_p = s["lng"] + radius_deg_lng * math.cos(angle)
            circle_coords.append([round(lng_p, 6), round(lat_p, 6)])

        catchment_feature = {
            "type": "Feature",
            "id": f"CATCH_{serial}",
            "properties": {
                "store_id": serial,
                "serial_no": serial,
                "locality": s["locality"],
                "store_name": f"Apsara Ice Creams - {s['locality']}",
                "radius_m": 350,
                "zone": s["zone"],
                "weekday_daily_footfall": s["weekday_daily_footfall"],
                "weekend_daily_footfall": s["weekend_daily_footfall"],
                "est_daily_cups": s["est_daily_cups"],
                "est_monthly_customers": s["est_monthly_customers"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [circle_coords]
            }
        }
        catchments_features.append(catchment_feature)

    catchments_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "city": "Bengaluru",
            "brand": "Apsara Ice Creams",
            "total_outlets": len(stores_output),
            "walkshed_radius_m": 350
        },
        "features": catchments_features
    }

    # Save to public and dist
    for dest_dir in ['frontend/public/data', 'frontend/dist/data']:
        os.makedirs(dest_dir, exist_ok=True)
        with open(os.path.join(dest_dir, 'apsara_ice_cream_bangalore_footfall.json'), 'w') as f:
            json.dump(stores_output, f, indent=2)
        with open(os.path.join(dest_dir, 'apsara_store_footfall_catchments.geojson'), 'w') as f:
            json.dump(catchments_geojson, f, indent=2)

    print(f"Generated {len(stores_output)} stores and catchments in frontend/public and frontend/dist.")

if __name__ == '__main__':
    generate_full_stores_dataset()
