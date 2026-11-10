import React from 'react';
import { 
  Clock, 
  RotateCcw,
  Footprints,
  Store,
  Layers,
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
    <header className="observatory-header relative z-30 select-none bg-white/95 backdrop-blur-md border-b border-ink-950/[0.08]">
      {/* AGT Signature Top 2px Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-azure-600 via-azure-500 to-violet-500" />

      <div className="px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: AGT Intelligence Official Logo & Product Title */}
        <div className="flex items-center gap-3 shrink-0">
          <a 
            href="https://agt-intelligence.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            title="AGT Intelligence — The standardised location intelligence layer for the world"
          >
            <img 
              src="./brand/agt-mark-ink.png" 
              alt="AGT Intelligence" 
              className="h-6 w-auto object-contain transition duration-200 group-hover:brightness-95" 
            />
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold tracking-tight text-ink-950 font-sans leading-none">
                AGT<span className="ml-[0.2em] text-[0.93em] font-normal uppercase tracking-[0.06em] text-ink-500">Intelligence</span>
              </span>
            </div>
          </a>

          <div className="h-5 w-px bg-ink-950/[0.1] hidden sm:block" />

          {/* Product & Spatial Context */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full border border-azure-500/30 bg-azure-500/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-azure-700 font-bold">
              AGTMap · Footfall
            </span>
            <span className="text-xs font-semibold text-ink-700 tracking-tight">
              Bengaluru Retail Dynamics
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isPeak 
                ? 'bg-azure-500/[0.08] text-azure-700 border-azure-500/30'
                : 'bg-paper-100 text-ink-600 border-ink-950/[0.08]'
            }`}>
              {isPeak ? '7–11 PM Peak' : 'Day Flow'}
            </span>
          </div>
        </div>

        {/* Center: Apsara Store Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-paper-50 p-1 rounded-lg border border-ink-950/[0.1] text-xs font-mono shrink-0 shadow-2xs">
            <Store className="w-3.5 h-3.5 text-azure-600 ml-0.5" />
            <span className="text-[10px] text-ink-500 uppercase tracking-wider font-bold hidden sm:inline">Client Store:</span>
            <select
              value={selectedApsaraStore?.serial_no || ''}
              onChange={(e) => {
                const match = apsaraStores.find(s => s.serial_no === e.target.value);
                if (match) onSelectApsaraStore(match);
              }}
              className="bg-white border border-ink-950/[0.12] rounded px-2 py-1 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer max-w-[150px] sm:max-w-[210px]"
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
              className="px-2.5 py-1 rounded bg-ink-950 text-white hover:bg-ink-800 text-[10px] font-semibold transition-all shadow-2xs"
              title="Open 13 Store Dossier"
            >
              Dossier
            </button>
          </div>
        </div>

        {/* Right: Day Selector & Navigation */}
        <div className="flex items-center space-x-2">
          {/* Day Type Toggle */}
          <div className="flex items-center bg-paper-100 p-0.5 rounded-lg border border-ink-950/[0.08] text-xs font-mono">
            <button
              onClick={() => setActiveDayType && setActiveDayType('weekday')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeDayType === 'weekday'
                  ? 'bg-white text-ink-950 font-bold shadow-xs'
                  : 'text-ink-500 hover:text-ink-950'
              }`}
            >
              Weekday
            </button>
            <button
              onClick={() => setActiveDayType && setActiveDayType('weekend')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeDayType === 'weekend'
                  ? 'bg-azure-600 text-white font-bold shadow-xs'
                  : 'text-ink-500 hover:text-ink-950'
              }`}
            >
              Weekend (+73%)
            </button>
          </div>

          {/* 2D Planar GIS Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-paper-50 border border-azure-500/25 text-xs font-mono text-azure-700">
            <span className="w-2 h-2 rounded-full bg-azure-500 animate-pulse" />
            <span className="font-semibold text-[11px]">AGT 2D GIS</span>
          </div>

          {/* Reset View */}
          <button
            onClick={onResetCityView}
            className="p-1 px-2.5 rounded-lg bg-white border border-ink-950/[0.12] text-ink-600 hover:text-ink-950 hover:bg-paper-50 transition-colors flex items-center gap-1 text-xs font-mono shadow-2xs"
            title="Reset to Bengaluru City View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
