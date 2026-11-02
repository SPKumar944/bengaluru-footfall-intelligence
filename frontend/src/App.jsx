import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import ScientificLeftPanel from './components/ScientificLeftPanel';
import BottomTransectBar from './components/BottomTransectBar';
import TopRightLegend from './components/TopRightLegend';
import LayerSwitcherDock from './components/LayerSwitcherDock';
import SingleLocationAuditModal from './components/SingleLocationAuditModal';
import MapViewport from './components/MapViewport';
import { Loader2 } from 'lucide-react';

const BENGALURU_2D_VIEW = {
  longitude: 77.625,
  latitude: 12.965,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Engagement Mode: 'model2_top5' | 'model1_audit'
  const [engagementMode, setEngagementMode] = useState('model2_top5');
  const [showLayerDock, setShowLayerDock] = useState(false);

  // Multi-Resolution Geospatial Datasets
  const [grid1kmData, setGrid1kmData] = useState(null);
  const [mobility150mData, setMobility150mData] = useState(null);
  const [originFlowsData, setOriginFlowsData] = useState([]);
  const [competitorsData, setCompetitorsData] = useState(null);
  const [complementaryData, setComplementaryData] = useState(null);
  const [businessZonesData, setBusinessZonesData] = useState(null);
  const [infraData, setInfraData] = useState(null);
  const [roadTrafficData, setRoadTrafficData] = useState(null);
  const [top5CatchmentsData, setTop5CatchmentsData] = useState(null);
  const [executiveReports, setExecutiveReports] = useState([]);
  const [regionalFootfallMatrix, setRegionalFootfallMatrix] = useState([]);

  // Temporal Dynamic State (24-Hour Diurnal Player)
  const [activeHour, setActiveHour] = useState(21); // Default 9:00 PM peak dessert window
  const [activeDayType, setActiveDayType] = useState('weekend'); // 'weekend' | 'weekday'
  const [isPlayingHour, setIsPlayingHour] = useState(false);

  // Selected Entities
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [auditLocation, setAuditLocation] = useState({ lat: 12.9698, lon: 77.7499, label: 'Whitefield (ITPL Corridor)' });

  // Layer Configuration (Default to pure footfall: points removed)
  const [layerConfig, setLayerConfig] = useState({
    macro1kmMode: 'off',
    showMobility150m: true, // Primary 150m Footfall Grid
    showOriginFlows: true,  // Visitor Footfall Desire Lines
    showBusinessZones: true, // Commercial Trade Corridors
    showRoadTraffic: false,
    showIsochrones: false,
    showCompetitors: false, // Points removed
    showComplementary: false, // Points removed
    showInfra: false, // Points removed
    showCannibalizationShield: false
  });

  const [infraCategoryFilter, setInfraCategoryFilter] = useState('All');
  const [viewState, setViewState] = useState(BENGALURU_2D_VIEW);

  // Fetch all 8 client layers, matrices and reports
  useEffect(() => {
    async function loadAllLayers() {
      try {
        setLoading(true);
        const b = import.meta.env.BASE_URL;
        const [
          g1km, m150m, flows, comps, complem, bzones, infra, roads, catchments, reports, regMatrix
        ] = await Promise.all([
          fetch(`${b}data/layer1_2_3_grid_1km.geojson`).then(r => r.json()),
          fetch(`${b}data/layer4_mobility_150m.geojson`).then(r => r.json()),
          fetch(`${b}data/visitor_origin_flows.json`).then(r => r.json()),
          fetch(`${b}data/layer5_competitors.geojson`).then(r => r.json()),
          fetch(`${b}data/layer6_complementary_brands.geojson`).then(r => r.json()),
          fetch(`${b}data/layer7_business_zones.geojson`).then(r => r.json()),
          fetch(`${b}data/layer8_infra_amenities.geojson`).then(r => r.json()),
          fetch(`${b}data/layer9_road_traffic_corridors.geojson`).then(r => r.json()),
          fetch(`${b}data/top5_hotspot_catchments.geojson`).then(r => r.json()),
          fetch(`${b}data/polar_bear_executive_reports.json`).then(r => r.json()),
          fetch(`${b}data/regional_hourly_footfall_matrix.json`).then(r => r.json()).catch(() => [])
        ]);

        setGrid1kmData(g1km);
        setMobility150mData(m150m);
        setOriginFlowsData(flows);
        setCompetitorsData(comps);
        setComplementaryData(complem);
        setBusinessZonesData(bzones);
        setInfraData(infra);
        setRoadTrafficData(roads);
        setTop5CatchmentsData(catchments);
        setExecutiveReports(reports);
        setRegionalFootfallMatrix(regMatrix);

        if (reports && reports.length > 0) {
          setSelectedRegion(reports[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load spatial layers:', err);
        setError('Failed to load layer datasets. Please verify data/manifest_checksums.json.');
        setLoading(false);
      }
    }

    loadAllLayers();
  }, []);

  // Automatic 24-Hour Diurnal Timeline Animation Loop
  useEffect(() => {
    let timer;
    if (isPlayingHour) {
      timer = setInterval(() => {
        setActiveHour(h => (h + 1) % 24);
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlayingHour]);

  // Strict 2D Camera Navigation
  const resetCityView = () => {
    setViewState({
      longitude: 77.625,
      latitude: 12.965,
      zoom: 11.5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 800
    });
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    if (region?.coordinates) {
      setViewState(prev => ({
        ...prev,
        longitude: region.coordinates.lon,
        latitude: region.coordinates.lat,
        zoom: 13.5,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  const handleMapClick = (clickLat, clickLon) => {
    setAuditLocation({
      lat: clickLat,
      lon: clickLon,
      label: `Audit Site (${clickLat.toFixed(4)}, ${clickLon.toFixed(4)})`
    });
  };

  // Determine active legend layer label
  const getActiveLayerLabel = () => {
    if (layerConfig.macro1kmMode === 'pop') return 'Layer 1: Population Density (pop/km²)';
    if (layerConfig.macro1kmMode === 'pci') return 'Layer 2: Per Capita Income (₹/yr)';
    if (layerConfig.macro1kmMode === 'fb') return 'Layer 3: F&B Spend Wallet (₹ Lakhs)';
    if (layerConfig.macro1kmMode === 'gap') return 'Unmet Demand Gap Index';
    return `150m Dynamic Footfall (${activeHour}:00)`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-700 font-mono space-y-3">
        <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
        <div className="text-center">
          <p className="font-semibold text-slate-900 text-sm">Initializing 2D Scientific Observatory</p>
          <p className="text-xs text-slate-500 mt-0.5">Loading 1km/150m Raster Mesh & Layer Matrices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-800 font-mono p-4">
        <div className="observatory-card p-6 rounded-xl border border-red-300 max-w-md text-center space-y-2">
          <p className="font-bold text-red-600 text-sm">Pipeline Data Ingestion Error</p>
          <p className="text-xs text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded text-xs hover:bg-slate-800 transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#EBF0F5] overflow-hidden select-none">
      {/* 1. Scientific Header Bar */}
      <HeaderBar
        engagementMode={engagementMode}
        setEngagementMode={setEngagementMode}
        selectedRegion={selectedRegion}
        executiveReports={executiveReports}
        onSelectRegion={handleSelectRegion}
        onResetCityView={resetCityView}
        showLayerDock={showLayerDock}
        setShowLayerDock={setShowLayerDock}
      />

      {/* 2. Main 2D Map Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <MapViewport
          grid1kmData={grid1kmData}
          mobility150mData={mobility150mData}
          originFlowsData={originFlowsData}
          competitorsData={competitorsData}
          complementaryData={complementaryData}
          businessZonesData={businessZonesData}
          infraData={infraData}
          roadTrafficData={roadTrafficData}
          top5CatchmentsData={top5CatchmentsData}
          layerConfig={layerConfig}
          infraCategoryFilter={infraCategoryFilter}
          selectedRegion={selectedRegion}
          auditLocation={auditLocation}
          viewState={viewState}
          setViewState={setViewState}
          activeHour={activeHour}
          activeDayType={activeDayType}
          onMapClick={handleMapClick}
        />

        {/* 3. Left Scientific Analytical Panel (Dual Tab: Regional Dynamics vs Site Expansion) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          {engagementMode === 'model2_top5' ? (
            <ScientificLeftPanel
              selectedRegion={selectedRegion}
              executiveReports={executiveReports}
              onSelectRegion={handleSelectRegion}
              engagementMode={engagementMode}
              setEngagementMode={setEngagementMode}
              auditLocation={auditLocation}
              activeHour={activeHour}
              setActiveHour={setActiveHour}
              activeDayType={activeDayType}
              setActiveDayType={setActiveDayType}
              regionalFootfallMatrix={regionalFootfallMatrix}
            />
          ) : (
            <SingleLocationAuditModal
              auditLocation={auditLocation}
              setAuditLocation={setAuditLocation}
              grid1kmData={grid1kmData}
              competitorsData={competitorsData}
              complementaryData={complementaryData}
              onClose={() => setEngagementMode('model2_top5')}
            />
          )}
        </div>

        {/* 4. Layer Switcher Drawer (if toggled) */}
        {showLayerDock && (
          <div className="absolute top-4 left-[405px] z-20 pointer-events-auto shadow-2xl">
            <LayerSwitcherDock
              layerConfig={layerConfig}
              setLayerConfig={setLayerConfig}
              infraCategoryFilter={infraCategoryFilter}
              setInfraCategoryFilter={setInfraCategoryFilter}
            />
          </div>
        )}

        {/* 5. Top Right Floating Scientific Legend */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <TopRightLegend
            viewState={viewState}
            activeLayerName={getActiveLayerLabel()}
            minVal={0}
            maxVal={100}
            unit="pts"
          />
        </div>

        {/* 6. Simple 2D Zoom Controls (Bottom Right of Map) */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center space-x-1 observatory-card p-1 rounded-lg border border-slate-300">
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.min(18, v.zoom + 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.max(8, v.zoom - 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* 7. Bottom Zonal Transect Bar & Dynamic 24-Hour Scrubber */}
      <div className="relative z-20 w-full shrink-0">
        <BottomTransectBar
          executiveReports={executiveReports}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          activeHour={activeHour}
          setActiveHour={setActiveHour}
          activeDayType={activeDayType}
          setActiveDayType={setActiveDayType}
          isPlayingHour={isPlayingHour}
          setIsPlayingHour={setIsPlayingHour}
          regionalFootfallMatrix={regionalFootfallMatrix}
        />
      </div>
    </div>
  );
}
