# WORKFLOW: Autonomous Bengaluru Ice Cream Geospatial Market Intelligence & WebGL Dashboard
**Execution Mode:** Full Autonomous Overnight Run (Zero-HITL until final browser verification)
**Target Region:** Bengaluru (BBMP limits, Bounding Box: [77.45, 12.83, 77.78, 13.14], Projected CRS: EPSG:32643)

## SYSTEM DIRECTIVES FOR ANTIGRAVITY ORCHESTRATOR
1. You are running unattended overnight. Do NOT stop to ask for confirmation on package installations, API timeouts, or minor schema mismatches.
2. Leverage parallel subagents where appropriate (e.g., Data Ingestion Pipeline vs. Frontend Scaffolding), but strictly enforce the `data/manifest_checksums.json` synchronization gate before binding data to the frontend.
3. Every Python script MUST include `try/except` blocks with exponential backoff (3 retries) for Overpass/OSMnx network calls. If an external API rate-limits or fails at night, automatically invoke a deterministic spatial fallback generator calibrated to real Bengaluru localities (Indiranagar, Koramangala, Jayanagar, HSR Layout, Whitefield, Malleshwaram, JP Nagar, Kengeri, Hebbal, Electronic City) so the pipeline never crashes and always produces rich, realistic spatial distributions.

---

## STAGE 1: WORKSPACE INITIALIZATION & ENVIRONMENT SETUP
1. Create the directory structure: `config/`, `data/01_raw/`, `data/02_intermediate/`, `data/03_processed_h3/`, `pipeline/`, `frontend/`, `logs/`.
2. Initialize a Python virtual environment (`.venv`) and install:
   `geopandas shapely h3 duckdb osmnx networkx requests pandas numpy scipy scikit-learn pyarrow fastparquet pyyaml`
3. Write `config/study_area_bbmp.json` defining the Bengaluru bounding box and key commercial micro-markets with their exact lat/lon centroids.
4. Write `config/model_weights.yaml` defining MCDA weights and Huff gravity parameters.

---

## STAGE 2: GEOSPATIAL DATA ENGINEERING PIPELINE (`/pipeline`)

### Task 2.1: Competitor & Footfall Synergy Extraction (`pipeline/01_ingest_osm_competitors.py`)
- Query OpenStreetMap Overpass API within the Bengaluru bounding box for:
  1. **Competitors:** `amenity=ice_cream`, `shop=ice_cream`, `cuisine~"(ice_cream|dessert|gelato)"`, plus brand matching (Corner House, Natural, Baskin Robbins, Polar Bear, Milano, Ibaco, Amul, Arun). Classify as `Tier_1_Destination` or `Tier_2_Mass`.
  2. **Footfall Magnets (Synergy POIs):** `amenity~"restaurant|fast_food|cafe|cinema|college|university"`, `railway=station` (Namma Metro stations), `leisure=park`.
- Export `competitors.parquet`, `competitors.geojson`, and `synergy_pois.parquet` to `data/02_intermediate/` and `frontend/public/data/`.

### Task 2.2: H3 Hexagonal Tessellation & Demographic Footfall Modeling (`pipeline/02_demographics_footfall.py`)
- Tessellate Bengaluru bounding box into Uber H3 Resolution 8 and Resolution 9.
- Compute for each H3 cell:
  - `pop_density_km2`: Resident + daytime floating population.
  - `youth_affluence_index`: 0-100 score reflecting student, tech corridor, and apartment density.
  - `footfall_synergy_score`: Spatial KDE score based on dining, transit, and leisure POIs within `k_ring=2`.
  - `competitor_count_1km`: Existing ice cream parlors within 1 km.
  - `nearest_tier1_dist_m`: Distance in meters to the nearest Tier-1 competitor.

### Task 2.3: Street Network Isochrone Engine (`pipeline/03_network_isochrones.py`)
- Identify the Top 20 Candidate Expansion Sites across distinct Bengaluru neighborhoods.
- Using `osmnx` / `networkx` (with robust network impedance fallback), generate 3 catchment polygons per site:
  - `5_min_walk` (4.5 km/h pedestrian catchment)
  - `10_min_drive` (22 km/h urban traffic catchment)
  - `15_min_delivery` (25 km/h food-delivery aggregator catchment)
- Zonal statistics inside each isochrone: Total Catchment Population, Total Complementary Dining POIs, Existing Competitors, Projected Daily Cup Demand, Cannibalization Risk, and Projected Monthly Revenue.
- Export `candidate_isochrones.geojson` and `candidate_sites_summary.json` to `frontend/public/data/`.

### Task 2.4: Huff Gravity Model & Master H3 Scoring (`pipeline/04_h3_gravity_scoring.py`)
- Compute Ice Cream Market Potential Index (`impi_score`, 0 to 100):
  `IMPI = 0.30 * norm(pop_density) + 0.35 * norm(footfall_synergy) + 0.20 * norm(youth_affluence) - 0.15 * norm(competitor_saturation)`
- Compute Huff Gravity flow vectors (`gravity_arcs.json`) linking top demand hexagons to candidate sites.
- Export `blr_h3_market_grid.json` to `frontend/public/data/`.
- Write `data/manifest_checksums.json` auditing SHA-256 and row counts.

---

## STAGE 3: CLIENT-GRADE WEBGL MAP DASHBOARD (`/frontend`)
- React + Vite + Tailwind CSS + MapLibre GL JS + Deck.gl
- High-contrast Architectural Spatial Intelligence UI (Carto Dark/Positron).
- Dynamic MCDA weight simulation sliders (60 FPS re-scoring on client).
- 3D Extruded H3 Hexagons, Isochrone rings, Competitor pins, and Gravity Arcs.
- Candidate Site Scorecard, Leaderboard, and Recharts Radar / Profile Chart.

---

## STAGE 4: SELF-VERIFICATION & AUDIT
- Orchestrator execution with 100% manifest verification.
- Frontend build validation (`npm run build`).
- Live dev server on port 5173.
