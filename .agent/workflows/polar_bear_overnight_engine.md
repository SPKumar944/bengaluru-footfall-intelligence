# WORKFLOW: Polar Bear Ice Creams — Multi-Resolution Spatial Intelligence & Site Suitability Platform
**Client:** Polar Bear Ice Creams (Market Expansion & Site Suitability Engine)
**Study Area:** Bengaluru Urban (BBMP Bounding Box: `[77.45, 12.83, 77.78, 13.14]`, Metric CRS: `EPSG:32643` UTM Zone 43N, Web CRS: `EPSG:4326`)
**Execution Mode:** Full Autonomous Pipeline & Interactive WebGL Studio.

## CRITICAL ORCHESTRATION RULES
1. **Strict Schema & Resolution Compliance:** Generate all 8 Client Data Layers at their exact specified spatial resolutions (`1km x 1km Grid`, `150m x 150m Grid`, `Business Zone Polygons`, and `Rich Attribute Points`), plus Road Traffic & Origin-Destination Desire Lines.
2. **Resilient Data Fetching:** Every Overpass API / OSMnx query runs with a 180-second timeout, 3 exponential-backoff retries, and an automatic high-density spatial calibration fallback anchored to 18 real Bengaluru commercial hubs (Indiranagar, Koramangala, Jayanagar, JP Nagar, HSR Layout, Whitefield, Malleshwaram, Rajajinagar, Banashankari, Kengeri, Electronic City, Marathahalli, Bellandur, Kalyan Nagar, Kammanahalli, Yelahanka, Hebbal, MG Road/Brigade Road) so no file is ever empty.
3. **Dual Engagement Model UI:** The React + Deck.gl dashboard features:
   - **Engagement Model 1 (Single Location Market Intelligence Report):** User inputs any Lat/Long or clicks any location on the map to generate a 1km/2km catchment audit, Customer Origin-Destination ("Where Visitors Come From") flow map, and printable executive scorecard.
   - **Engagement Model 2 (City-Wide Hotspot Identification — Top 5 Regions):** Displays the ranked Top 5 Expansion Hotspots for Bengaluru (Tier-1 City) with gap analysis, cannibalization checks against existing Polar Bear stores, and full executive dossiers.
