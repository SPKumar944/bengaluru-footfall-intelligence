import React from 'react';
import { 
  Clock, 
  RotateCcw,
  Flame,
  Footprints
} from 'lucide-react';

export default function HeaderBar({
  activeHour = 21,
  activeDayType = 'weekend',
  setActiveDayType,
  onResetCityView
}) {
  const isPeak = activeHour >= 19 && activeHour <= 23;

  return (
    <header className="observatory-header relative z-30 px-5 py-2.5 flex items-center justify-between select-none bg-white border-b border-[#DCE3EC]">
      {/* Left: Clean Title & Spatial Context */}
      <div>
        <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          <span className="font-bold text-red-700 flex items-center gap-1">
            <Footprints className="w-3 h-3 text-red-600 inline" />
            STREET FOOTFALL DYNAMICS
          </span>
          <span>•</span>
          <span>INDIRANAGAR, BENGALURU</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">6,699 ROAD SEGMENTS</span>
        </div>
        <div className="flex items-baseline space-x-2.5 mt-0.5">
          <h1 className="font-sans text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Indiranagar Pedestrian Footfall Dynamics
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isPeak 
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              {isPeak ? '🔥 7-11 PM Post-Dinner Dessert Peak' : 'Standard Traffic Flow'}
            </span>
          </h1>
          <span className="hidden xl:inline text-xs font-mono text-slate-500">
            100 Feet Road • 12th Main • CMH Road • Metro Station Node
          </span>
        </div>
      </div>

      {/* Center: Live Time & Day Selector */}
      <div className="flex items-center space-x-3">
        {/* Day Type Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekday')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeDayType === 'weekday'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekday
          </button>
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekend')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeDayType === 'weekend'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekend (+73% Surge)
          </button>
        </div>

        {/* 2D Planar Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold">2D Planar GIS</span>
        </div>

        {/* Reset View */}
        <button
          onClick={onResetCityView}
          className="p-1.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-mono"
          title="Reset to Indiranagar Center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Center Indiranagar</span>
        </button>
      </div>
    </header>
  );
}
