import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import BottomTransectBar from './components/BottomTransectBar';
import TopRightLegend from './components/TopRightLegend';
import MapViewport from './components/MapViewport';
import { Loader2 } from 'lucide-react';

const INDIRANAGAR_2D_VIEW = {
  longitude: 77.6412,
  latitude: 12.9730,
  zoom: 14.6,
  pitch: 0,
  bearing: 0
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Indiranagar Street Network Footfall Dataset
  const [streetFootfallData, setStreetFootfallData] = useState(null);

  // Temporal Dynamic State (24-Hour Diurnal Player)
  const [activeHour, setActiveHour] = useState(21); // Default 9:00 PM peak dessert window
  const [activeDayType, setActiveDayType] = useState('weekend'); // 'weekend' | 'weekday'
  const [isPlayingHour, setIsPlayingHour] = useState(false);

  const [viewState, setViewState] = useState(INDIRANAGAR_2D_VIEW);

  // Load Indiranagar Street Network Footfall
  useEffect(() => {
    async function loadFootfall() {
      try {
        setLoading(true);
        const b = import.meta.env.BASE_URL;
        const res = await fetch(`${b}data/indiranagar_street_footfall.geojson`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStreetFootfallData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Indiranagar footfall dataset:', err);
        setError('Failed to load indiranagar_street_footfall.geojson.');
        setLoading(false);
      }
    }

    loadFootfall();
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

  // Reset to Indiranagar Center View
  const resetIndiranagarView = () => {
    setViewState({
      longitude: 77.6412,
      latitude: 12.9730,
      zoom: 14.6,
      pitch: 0,
      bearing: 0,
      transitionDuration: 800
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-700 font-mono space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-900 text-sm">Loading Indiranagar Footfall Dynamics</p>
          <p className="text-xs text-slate-500 mt-0.5">Fetching 6,699 street network segments & diurnal traffic arrays...</p>
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
      {/* 1. Header Bar: Clean Context & Time Controls */}
      <HeaderBar
        activeHour={activeHour}
        activeDayType={activeDayType}
        setActiveDayType={setActiveDayType}
        onResetCityView={resetIndiranagarView}
      />

      {/* 2. Main 2D Footfall Map Canvas (Full screen, ZERO left card) */}
      <div className="relative flex-1 w-full overflow-hidden">
        <MapViewport
          streetFootfallData={streetFootfallData}
          viewState={viewState}
          setViewState={setViewState}
          activeHour={activeHour}
          activeDayType={activeDayType}
        />

        {/* 3. Top Right Floating Footfall Intensity Legend */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <TopRightLegend
            viewState={viewState}
            activeLayerName={`Footfall Density (${activeHour}:00)`}
            minVal="Low (<200/hr)"
            maxVal="Peak (>2.5k/hr)"
            unit="flow"
          />
        </div>

        {/* 4. Simple 2D Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center space-x-1 observatory-card p-1 rounded-lg border border-slate-300 bg-white/95 backdrop-blur shadow-md">
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.min(18, v.zoom + 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.max(11, v.zoom - 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* 5. Bottom 24-Hour Diurnal Timeline Scrubber & Live Flow Readout */}
      <div className="relative z-20 w-full shrink-0">
        <BottomTransectBar
          activeHour={activeHour}
          setActiveHour={setActiveHour}
          activeDayType={activeDayType}
          isPlayingHour={isPlayingHour}
          setIsPlayingHour={setIsPlayingHour}
        />
      </div>
    </div>
  );
}
