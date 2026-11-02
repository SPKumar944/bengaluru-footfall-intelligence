import React from 'react';
import { 
  Users, 
  MapPin, 
  RotateCcw,
  Clock,
  Navigation
} from 'lucide-react';

export default function HeaderBar({
  selectedRegion,
  onSelectRegion,
  onResetCityView
}) {
  const corridors = [
    { name: 'Indiranagar', lat: 12.9719, lon: 77.6412 },
    { name: 'Koramangala', lat: 12.9352, lon: 77.6245 },
    { name: 'Whitefield', lat: 12.9698, lon: 77.7499 },
    { name: 'HSR Layout', lat: 12.9121, lon: 77.6446 },
    { name: 'Bellandur', lat: 12.9260, lon: 77.6762 },
    { name: 'JP Nagar', lat: 12.9063, lon: 77.5857 }
  ];

  const currentName = selectedRegion?.region_name || 'Indiranagar';

  return (
    <header className="observatory-header relative z-30 px-5 py-2.5 flex items-center justify-between select-none bg-white border-b border-[#DCE3EC]">
      {/* Left: Scientific Header & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          <span className="font-bold text-red-700">SPATIAL FOOTFALL OBSERVATORY</span>
          <span>•</span>
          <span>BENGALURU URBAN</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">150M MICRO-MOBILITY GRID</span>
          <span>•</span>
          <span>24-HR DIURNAL KINEMATICS</span>
        </div>
        <div className="flex items-baseline space-x-2.5 mt-0.5">
          <h1 className="font-sans text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Bengaluru Regional Footfall Intelligence
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Live Temporal Dynamics
            </span>
          </h1>
          <span className="hidden xl:inline text-xs font-mono text-slate-500">
            BBMP Urban Corridor (EPSG:32643) • Pure Pedestrian Flow & Density
          </span>
        </div>
      </div>

      {/* Center: Quick Corridor Jump Chips */}
      <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <span className="text-[10px] font-mono text-slate-400 px-1 font-semibold">Corridor:</span>
        {corridors.map(c => {
          const isActive = currentName.toLowerCase().includes(c.name.toLowerCase());
          return (
            <button
              key={c.name}
              onClick={() => {
                onSelectRegion && onSelectRegion({
                  region_id: `HUB_${c.name.toUpperCase().replace(/\s+/g, '_')}`,
                  region_name: `${c.name} (Commercial Corridor)`,
                  coordinates: { lat: c.lat, lon: c.lon }
                });
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Right: View Controls */}
      <div className="flex items-center space-x-2">
        {/* 2D Planar Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">2D Planar GIS</span>
        </div>

        {/* Reset City View */}
        <button
          onClick={onResetCityView}
          className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-mono"
          title="Reset to Full City Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset City View</span>
        </button>
      </div>
    </header>
  );
}
