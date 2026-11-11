# Bengaluru Retail Footfall Intelligence & Site Selection Platform
## Spatial Analytics & Micro-Market Expansion Architecture for Apsara Ice Creams (31 Outlets)

---

### Executive Overview

This repository houses the end-to-end geospatial intelligence, pedestrian kinematics engine, and multi-layered retail site selection framework developed for **Apsara Ice Creams** across **Bengaluru Urban**.

The platform captures, models, and visualizes urban footfall across **31 verified operating stores**, integrating **50,920 authentic OpenStreetMap (OSM) curved road vectors**, 24-hour diurnal pedestrian flow curves, competitive saturation metrics, and multi-source POI synergy clusters (QSRs, specialty cafes, tech parks, schools, and family leisure magnets).

- **Live Interactive Dashboard**: [https://spkumar944.github.io/bengaluru-footfall-intelligence/](https://spkumar944.github.io/bengaluru-footfall-intelligence/)
- **Target City**: Bengaluru, Karnataka, India
- **Network Scope**: 31 Verified Outlets (HSR, Indiranagar, Koramangala, Whitefield, Thanisandra, Electronic City, Jayanagar, etc.)
- **Primary Deliverable Package**: Staged for Google Drive upload under `Bengaluru_Apsara_Retail_Footfall_Intelligence/`

---

### Project Directory Structure & Organization

The deliverable is organized into 6 modular, self-contained directories designed for executive review, data science reproduction, and operational deployment:

```
Bengaluru_Apsara_Retail_Footfall_Intelligence/
│
├── README.md                                              <- Master project documentation & framework reference
│
├── 01_Executive_Reports_and_Documentation/
│   ├── Apsara_Ice_Cream_Store_Location_Factors.xlsx       <- 7-Column Master Matrix (Prem, Gaurav, Gopal remarks)
│   ├── STORE_DIRECTORY_31_LOCATIONS.csv                   <- Full tabular directory of all 31 stores with KPIs
│   └── DATASET_CATALOGUE.csv                              <- Complete catalogue of all spatial layers & schemas
│
├── 02_Master_Datasets_and_Layers/
│   ├── all_stores_street_footfall.geojson                 <- 50,920 authentic OSM road vectors with 24-hr flow
│   ├── apsara_store_footfall_catchments.geojson           <- 350m pedestrian walkshed circular polygon buffers
│   ├── apsara_ice_cream_bangalore_footfall.json           <- Master store metadata, operational hours, tickets
│   ├── layer5_competitors.geojson                         <- Direct artisanal & gourmet ice cream competitors
│   ├── layer6_complementary_brands.geojson                <- Footfall magnets (McDonald's, Starbucks, Glen's)
│   ├── education_youth_pois.geojson                       <- Universities, K-12 premier schools & coaching hubs
│   ├── kids_family_attractions.geojson                    <- Toy stores, gaming arcades, multiplexes, parks
│   ├── mapped_tech_parks.geojson                          <- Grade-A IT SEZ campuses (Manyata, Ecospace, RMZ)
│   ├── office_floor_parts.geojson                         <- Workplace floor plates & corporate density
│   ├── wards_demographics.geojson                         <- BBMP administrative ward census demographics
│   ├── hexagon_demographics.json                          <- Uber H3 spatial demographic & mobility grid
│   └── regional_hourly_footfall_matrix.json               <- 24-hour diurnal kinematics matrix
│
├── 03_Store_Wise_Data_and_Catchments/                     <- Individual store dossiers (31 dedicated folders)
│   ├── APSARA_BLR_01_HSR_Layout/
│   │   ├── store_profile.json                             <- Store-specific metadata & operating metrics
│   │   ├── osm_street_network.geojson                     <- Filtered OSM road network around store
│   │   └── pedestrian_catchment_350m.geojson              <- Exact 350m walkshed polygon
│   ├── ...
│   └── APSARA_BLR_31_Budigere_Cross/
│
├── 04_Raw_Source_Data/
│   ├── osm_raw_stores/                                    <- Raw OpenStreetMap API & Overpass GeoJSON extractions
│   ├── scraped_blr_stores.json                            <- Raw scraped brand store locator records
│   └── gmaps_indiranagar_scraped.json                     <- Google Places raw payload verification
│
├── 05_Pipelines_and_Analytics_Scripts/
│   ├── build_full_authentic_osm_streets.py                <- Compiles real OSM vectors & diurnal curves
│   ├── calibrate_pedestrian_footfall.py                   <- Calibrates pedestrian flow to realistic urban kinetics
│   ├── build_education_youth_pois.py                      <- Assembles student & education POI layers
│   ├── build_comprehensive_complementary_brands.py        <- Maps QSR, cafe, and dessert synergy anchors
│   ├── fetch_real_osm_roads_for_stores_14_31.py           <- Automated Overpass extractor
│   ├── fetch_remaining_stores_osm.py                      <- Direct OpenStreetMap API boundary extractor
│   └── generate_store_factors_excel.py                    <- Generates the 7-column master Excel matrix
│
└── 06_Interactive_Web_Dashboard_Distribution/              <- Standalone compiled production build (Vite/React)
    ├── index.html                                         <- Single-page application entry point
    ├── assets/                                            <- Minified JS, CSS, and Deck.gl shaders
    ├── brand/                                             <- Official brand logos, banners, and marks
    ├── icons/                                             <- Custom IconMCP vector pins
    └── data/                                              <- Complete local GeoJSON runtime datasets
```

---

### The 8-Factor Retail Site Selection Framework

The dashboard evaluates every store location against an integrated 8-factor analytical framework:

```
1. Pedestrian Footfall & Mobility Dynamics
   ├── 24-Hour Diurnal Hourly Curve (Peak evening dessert rush: 19:00 – 23:30)
   ├── Day-of-Week Modulation (Weekday regular vs Friday–Sunday leisure surge: +38% to +54%)
   ├── Road Hierarchy & OSM Geometry Curvature (True curvature vs synthetic straight lines)
   ├── 350m Pedestrian Catchment Walkshed (5-minute maximum walking radius for impulse treats)
   └── High-Street Commercial Spine Frontage (Primary visibility vs rear-lane positioning)

2. Retail & Commercial Competition
   ├── Direct Artisanal / Gourmet Competitors (Naturals, Corner House, Polar Bear, Milano)
   ├── Value vs Premium Positioning & Pricing Landscape (Mass vs Gourmet white space)
   └── Brand Cannibalization Buffer (Optimal 2.5 km – 4.5 km inter-store spacing)

3. Synergy POIs & Complementary Brands
   ├── Quick Service Restaurants (QSRs) & Pizzerias (McDonald's, KFC, Domino's, Burger King)
   ├── Specialty Cafes & Premium Coffee Roasters (Third Wave, Starbucks, Blue Tokai, Glen's)
   └── Casual Dining Hubs & Micro-Breweries (Late-night post-dinner dessert demand)

4. Youth, Student & Educational Institutions
   ├── Universities & Higher Education Colleges (Christ, St. Joseph's, Amrita, RVCE)
   ├── K-12 Premium Private & International Schools (Afternoon school pickup treat surge)
   └── Coaching Institutes & EdTech Study Hubs (Allen, Aakash, FIITJEE study breaks)

5. Family, Child & Leisure Magnets
   ├── Toy Stores & Children's Apparel Outlets (Hamleys, FirstCry, Mothercare)
   ├── Gaming Arcades & Family Entertainment Centers (Timezone, Fun City, Smaaash)
   ├── Cinema Multiplexes & Movie Theatres (PVR, INOX, Cinepolis post-show traffic)
   └── Public Parks, Lakes & Recreational Promenades (Weekend family leisure crowds)

6. Employment Hubs & Workplace Gravity
   ├── Grade-A Tech Parks & IT SEZ Campuses (Manyata, Ecospace, RMZ, Prestige)
   └── Post-Work Social Unwind Flow (5:00 PM – 8:30 PM commute-home corridor positioning)

7. Demographics & Resident Profiles
   ├── Population Density & Household Affluence (SEC A1/A2 residential baseline)
   └── Age Cohort Balance (Kids 0-14 and Young Adults 15-34 demographic gravity)

8. Real Estate, Store Design & Accessibility
   ├── Namma Metro Station Proximity & Transit Corridors (High commuter footfall)
   ├── Curbside Accessibility & Two-Wheeler / Car Parking (Low friction access)
   ├── High-Street Standalone vs Shopping Mall Retail Format (Lease margin comparison)
   └── Delivery Aggregator Proximity & Dark-Store Logistics (Swiggy / Zomato / Zepto dispatch)
```

---

### Key Stakeholder Perspectives in the Matrix

The master Excel workbook (`01_Executive_Reports_and_Documentation/Apsara_Ice_Cream_Store_Location_Factors.xlsx`) contains dedicated analytical evaluations for each sub-factor across three executive roles:

1. **Prem Remarks (GIS & Spatial Analytics Lead)**:
   - Focuses on spatial kinematics, distance decay curves, Uber H3 spatial indexing, Overpass OSM vector curvature verification, and quantitative diurnal flow modeling.
2. **Gaurav Remarks (Business Strategy & Real Estate Expansion Lead)**:
   - Focuses on lease economics, Capex efficiency, rental payback thresholds (target 6–9 months), cannibalization buffers, and unit EBITDA margins.
3. **Gopal Remarks (Retail & Brand Operations Lead)**:
   - Focuses on peak evening customer throughput (<90 sec service time), cold-chain freezer storage buffers (2.5x by Friday morning), delivery rider dispatch staging, and inventory replenishment logistics.

---

### 31-Store Network Overview (Bengaluru Urban)

| Store ID | Locality | Zone | Primary Commercial Spine | Est. Monthly Customers | Est. Daily Cups | Weekend Surge % |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **APSARA_BLR_01** | HSR Layout | South East | 19th Main & 27th Main High Street | 4,045 | 134 | +43.5% |
| **APSARA_BLR_02** | Indiranagar | East | 100 Feet Road & 12th Main Commercial | 4,210 | 140 | +42.9% |
| **APSARA_BLR_03** | Koramangala | South East | 80 Feet Road & 5th Block Food Spine | 4,120 | 137 | +44.1% |
| **APSARA_BLR_04** | Whitefield | East | Whitefield Main Rd & ITPL Corridor | 3,850 | 128 | +46.8% |
| **APSARA_BLR_05** | Bellandur | South East | Green Glen Layout & Ecospace Outer | 3,690 | 123 | +48.2% |
| **APSARA_BLR_06** | JP Nagar | South | 24th Main & Brigade Millennium Hub | 3,920 | 130 | +41.5% |
| **APSARA_BLR_07** | Basavanagudi | South | DVG Road & Gandhi Bazaar Spine | 4,350 | 145 | +39.4% |
| **APSARA_BLR_08** | Yelahanka | North | Major Sandeep Unnikrishnan Rd | 3,420 | 114 | +45.2% |
| **APSARA_BLR_09** | Vidyaranyapura | North | Vidyaranyapura Main & BEL Layout | 3,310 | 110 | +42.1% |
| **APSARA_BLR_10** | Hennur / Kothanur | North East | Hennur Bagalur Main Commercial | 3,550 | 118 | +47.6% |
| **APSARA_BLR_11** | Malleshwaram | North West | Sampige Road & 8th Cross Spine | 4,480 | 149 | +38.8% |
| **APSARA_BLR_12** | Banashankari | South | Kathreguppe 80ft Commercial Corridor | 3,740 | 124 | +43.0% |
| **APSARA_BLR_13** | Jayanagar | South | 11th Main 4th Block Retail Heart | 4,620 | 154 | +37.5% |
| **APSARA_BLR_14** | Kanakapura Road | South | Kanakapura NH948 Metro Corridor | 2,850 | 95 | +50.6% |
| **APSARA_BLR_15** | Ramamurthy Nagar | East | Ramamurthy Nagar Main Commercial | 2,780 | 92 | +48.5% |
| **APSARA_BLR_16** | Vijayanagar | West | 1st Main Club Road Commercial Spine | 3,120 | 104 | +44.2% |
| **APSARA_BLR_17** | Kasavanahalli | South East | Kasavanahalli Main & Amrita Link | 3,250 | 108 | +49.1% |
| **APSARA_BLR_18** | Gunjur / Varthur | East | Gunjur-Varthur Main Transit Spine | 2,640 | 88 | +52.3% |
| **APSARA_BLR_19** | Bilekahalli | South | Vijaya Bank Layout Commercial | 2,980 | 99 | +47.8% |
| **APSARA_BLR_20** | Hebbal Kempapura | North | Coffee Board Layout & Bellary Outer | 3,050 | 101 | +46.5% |
| **APSARA_BLR_21** | Kadugodi / Seegehalli | East | Whitefield-Hosakote Main Transit | 2,720 | 90 | +51.0% |
| **APSARA_BLR_22** | Rajarajeshwari Nagar | West | BEML Layout Commercial Spine | 3,180 | 106 | +43.8% |
| **APSARA_BLR_23** | Hoodi | East | Mahadevapura-ITPL Link Corridor | 2,890 | 96 | +49.5% |
| **APSARA_BLR_24** | Kodathi Gate | South East | Sarjapur Road Corporate Corridor | 2,810 | 93 | +51.2% |
| **APSARA_BLR_25** | Electronic City Phase 2 | South | Ananth Nagar Main Commercial | 2,750 | 91 | +53.4% |
| **APSARA_BLR_26** | Electronic City Phase 1 | South | Neeladri Road Retail Spine | 3,380 | 112 | +50.8% |
| **APSARA_BLR_27** | Sarjapura Town | South East | Sarjapura Circle Commercial Core | 2,520 | 84 | +54.1% |
| **APSARA_BLR_28** | Thanisandra | North | Thanisandra Main & Manyata Outer | 2,850 | 95 | +49.4% |
| **APSARA_BLR_29** | Mallathahalli | West | Papareddypalya Main Corridor | 2,910 | 97 | +45.6% |
| **APSARA_BLR_30** | Hesaraghatta Road | North West | Chimney Hills Transit Spine | 2,690 | 89 | +48.0% |
| **APSARA_BLR_31** | Budigere Cross | East | Old Madras Road (NH75) Growth Axis | 2,480 | 82 | +55.0% |

---

### Technical Methodology

#### 1. Real OpenStreetMap Road Curvature Extraction
Rather than mathematical straight lines or bounding box approximations, real road geometries were extracted directly via the OpenStreetMap API and Overpass endpoints:
- Filtered to pedestrian and motorable corridors (`primary`, `secondary`, `tertiary`, `residential`, `living_street`, `service`).
- Each road preserves multi-point coordinate vertices matching the vector tile basemap (e.g., *Thanisandra Main Road* preserves 78 curvature points).

#### 2. Calibrated 11-Step Footfall Color Palette
Pedestrian flows are mapped to an 11-step hexadecimal ramp spanning from low access lanes to premier high streets:
```
Tier 1:  < 50 / hr       #001f4d  (Deep Navy)         Internal service lanes / private access
Tier 2:  50 – 120 / hr   #0a3d8f  (Dark Blue)         Quiet residential cross streets
Tier 3:  120 – 250 / hr  #1565c0  (Royal Blue)        Neighborhood feeder avenues
Tier 4:  250 – 400 / hr  #1e88e5  (Cerulean Blue)     Mixed-use residential connectors
Tier 5:  400 – 650 / hr  #29b6f6  (Sky Blue)          Moderate commercial & grocery streets
Tier 6:  650 – 900 / hr  #80deea  (Teal)              Active commercial secondary avenues
Tier 7:  900 – 1200 / hr #a5d6a7  (Mint Green)        High commercial corridors (CMH Rd, 12th Main)
Tier 8:  1200 – 1550 / hr#ffee58  (Vibrant Yellow)    Dense retail arteries & transit hubs
Tier 9:  1550 – 1900 / hr#ff7043  (Coral Orange)      Prime high-street commercial spines
Tier 10: 1900 – 2400 / hr#d32f2f  (Crimson Red)       Flagship high streets during weekend surge
Tier 11: > 2400 / hr     #7b0000  (Deep Burgundy)     Extraordinary festival / holiday peak
```

#### 3. 350m Pedestrian Catchment Walkshed
- Circular buffers of 350m radius represent the maximum willing walking distance of an impulse dessert consumer.
- When an individual store is selected in the dashboard, the map dynamically scopes to this 350m walkshed, filtering out extraneous citywide traffic.

---

### Instructions to Run & Reproduce

#### Local Offline Dashboard
```bash
# Navigate to the dashboard distribution
cd 06_Interactive_Web_Dashboard_Distribution

# Serve locally using any HTTP server
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

#### Re-running the Data Pipelines
```bash
# Activate Python 3.10+ virtual environment
source .venv/bin/activate

# Regenerate OSM street network & footfall calibration
python3 05_Pipelines_and_Analytics_Scripts/build_full_authentic_osm_streets.py

# Regenerate 7-column Excel factor matrix
python3 05_Pipelines_and_Analytics_Scripts/generate_store_factors_excel.py
```

---
*Prepared for Apsara Ice Creams Retail Network Intelligence Team | Bengaluru Urban Micro-Market Expansion | November 2026*
