import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import ScientificLeftPanel from './components/ScientificLeftPanel';
import BottomTransectBar from './components/BottomTransectBar';
import TopRightLegend from './components/TopRightLegend';
import MapViewport from './components/MapViewport';
import { Loader2 } from 'lucide-react';

const BENGALURU_2D_VIEW = {
  longitude: 77.6412,
  latitude: 12.9719,
  zoom: 13.0,
  pitch: 0,
  bearing: 0
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pure Footfall Geospatial Datasets
  const [mobility150mData, setMobility150mData] = useState(null);
  const [originFlowsData, setOriginFlowsData] = useState([]);
  const [regionalFootfallMatrix, setRegionalFootfallMatrix] = useState([]);

  // Temporal Dynamic State (24-Hour Diurnal Player)
  const [activeHour, setActiveHour] = useState(21); // Default 9:00 PM peak dessert window
  const [activeDayType, setActiveDayType] = useState('weekend'); // 'weekend' | 'weekday'
  const [isPlayingHour, setIsPlayingHour] = useState(false);

  // Selected Corridor (Default: Indiranagar)
  const [selectedRegion, setSelectedRegion] = useState({
    region_id: 'HUB_INDIRANAGAR',
    region_name: 'Indiranagar (100ft & 12th Main)',
    coordinates: { lat: 12.9719, lon: 77.6412 }
  });

  const [viewState, setViewState] = useState(BENGALURU_2D_VIEW);

  // Fetch only pure footfall datasets
  useEffect(() => {
    async function loadFootfallData() {
      try {
        setLoading(true);
        const b = import.meta.env.BASE_URL;
        const [m150m, flows, regMatrix] = await Promise.all([
          fetch(`${b}data/layer4_mobility_150m.geojson`).then(r => r.json()),
          fetch(`${b}data/visitor_origin_flows.json`).then(r => r.json()),
          fetch(`${b}data/regional_hourly_footfall_matrix.json`).then(r => r.json()).catch(() => [])
        ]);

        setMobility150mData(m150m);
        setOriginFlowsData(flows);
        setRegionalFootfallMatrix(regMatrix);

        if (regMatrix && regMatrix.length > 0) {
          const defaultIndiranagar = regMatrix.find(r => r.region_id === 'HUB_INDIRANAGAR') || regMatrix[0];
          setSelectedRegion(defaultIndiranagar);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load footfall datasets:', err);
        setError('Failed to load footfall layers. Please check data/regional_hourly_footfall_matrix.json.');
        setLoading(false);
      }
    }

    loadFootfallData();
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

  // Reset to full Bengaluru view
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
    const coords = region?.coordinates || (
      region?.corridors?.[0] ? { lat: 12.9719, lon: 77.6412 } : null
    );
    if (coords) {
      setViewState(prev => ({
        ...prev,
        longitude: coords.lon,
        latitude: coords.lat,
        zoom: 13.5,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-700 font-mono space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-900 text-sm">Initializing Spatial Footfall Observatory</p>
          <p className="text-xs text-slate-500 mt-0.5">Loading 150m Micro-Mobility Grid & Diurnal Footfall Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-800 font-mono p-4">
        <div className="observatory-card p-6 rounded-xl border border-red-300 max-w-md text-center space-y-2">
          <p className="font-bold text-red-600 text-sm">Footfall Data Loading Error</p>
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
      {/* 1. Header Bar: Pure Footfall Navigation */}
      <HeaderBar
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        onResetCityView={resetCityView}
      />

      {/* 2. Main 2D Footfall Map Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <MapViewport
          mobility150mData={mobility150mData}
          originFlowsData={originFlowsData}
          selectedRegion={selectedRegion}
          viewState={viewState}
          setViewState={setViewState}
          activeHour={activeHour}
          activeDayType={activeDayType}
        />

        {/* 3. Left Panel: Dedicated Regional Footfall Dynamics (Zero extra tabs) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          <ScientificLeftPanel
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            activeHour={activeHour}
            setActiveHour={setActiveHour}
            activeDayType={activeDayType}
            setActiveDayType={setActiveDayType}
            regionalFootfallMatrix={regionalFootfallMatrix}
          />
        </div>

        {/* 4. Top Right Floating Footfall Density Legend */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <TopRightLegend
            viewState={viewState}
            activeLayerName={`150m Footfall Density (${activeHour}:00)`}
            minVal="Low (150k)"
            maxVal="Peak (1.6M)"
            unit="flow"
          />
        </div>

        {/* 5. Clean 2D Zoom Controls */}
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

      {/* 6. Bottom Zonal Transect Bar & Dynamic 24-Hour Scrubber */}
      <div className="relative z-20 w-full shrink-0">
        <BottomTransectBar
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
