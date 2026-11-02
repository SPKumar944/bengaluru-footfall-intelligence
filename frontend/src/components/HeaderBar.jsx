import React from 'react';
import { 
  Clock, 
  RotateCcw,
  Flame,
  Footprints,
  Store,
  ChevronDown
} from 'lucide-react';

export default function HeaderBar({
  activeHour = 21,
  activeDayType = 'weekend',
  setActiveDayType,
  onResetCityView,
  apsaraStores = [],
  selectedApsaraStore,
  onSelectApsaraStore,
  onOpenApsaraModal
}) {
  const isPeak = activeHour >= 19 && activeHour <= 23;

  return (
    <header className="observatory-header relative z-30 px-4 py-2 flex items-center justify-between select-none bg-white border-b border-[#DCE3EC] gap-3">
      {/* Left: Clean Title & Spatial Context */}
      <div className="shrink-0">
        <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          <span className="font-bold text-red-700 flex items-center gap-1">
            <Footprints className="w-3 h-3 text-red-600 inline" />
            FOOTFALL DYNAMICS
          </span>
          <span>•</span>
          <span>BENGALURU</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">APSARA & COMPETITORS</span>
        </div>
        <div className="flex items-baseline space-x-2 mt-0.5">
          <h1 className="font-sans text-sm md:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Footfall Intelligence
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              isPeak 
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              {isPeak ? '7–11 PM Peak' : 'Day Flow'}
            </span>
          </h1>
        </div>
      </div>

      {/* Center: Apsara Store Selector Dropdown */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 bg-amber-50/80 p-1 rounded-lg border border-amber-200 text-xs font-mono shrink-0 shadow-2xs">
          <Store className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
          <span className="text-[10px] text-amber-800 font-bold hidden sm:inline">Apsara Outlet:</span>
          <select
            value={selectedApsaraStore?.serial_no || ''}
            onChange={(e) => {
              const match = apsaraStores.find(s => s.serial_no === e.target.value);
              if (match) onSelectApsaraStore(match);
            }}
            className="bg-white border border-amber-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[150px] sm:max-w-[200px]"
          >
            <option value="">Apsara Outlets (13)...</option>
            {apsaraStores.map((s) => (
              <option key={s.serial_no} value={s.serial_no}>
                #{s.serial_no.split('_')[2]} {s.locality} (Rating: {s.google_rating})
              </option>
            ))}
          </select>
          <button
            onClick={onOpenApsaraModal}
            className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-[10px] font-bold transition-all shadow-2xs"
            title="Open 13 Store Dossier"
          >
            Dossier
          </button>
        </div>
      </div>

      {/* Right: Day Selector & Navigation */}
      <div className="flex items-center space-x-2">
        {/* Day Type Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekday')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeDayType === 'weekday'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekday
          </button>
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekend')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeDayType === 'weekend'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekend (+73%)
          </button>
        </div>

        {/* 2D Planar Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold">2D GIS</span>
        </div>

        {/* Reset View */}
        <button
          onClick={onResetCityView}
          className="p-1 px-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-mono"
          title="Reset to City View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
