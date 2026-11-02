import React from 'react';
import { Play, Pause, Clock, Flame, Footprints, Zap } from 'lucide-react';

export default function BottomTransectBar({
  activeHour = 21,
  setActiveHour,
  activeDayType = 'weekend',
  isPlayingHour = false,
  setIsPlayingHour
}) {
  const isPeak = activeHour >= 19 && activeHour <= 23;

  // Calibrated Indiranagar aggregate footfall by hour
  const hourlyFlowIndiranagar = [
    540, 260, 130, 90, 120, 280,
    750, 1850, 3900, 4800, 3700, 3400,
    4400, 5100, 4100, 3500, 4200, 5400,
    6800, 7900, 8540, 7200, 4500, 2100
  ];

  const mult = activeDayType === 'weekend' ? 1.35 : 0.85;
  const currentTotalRate = Math.round(hourlyFlowIndiranagar[activeHour] * mult);

  const keyPhases = [
    { hour: 8, label: '08:00 Morning Transit' },
    { hour: 13, label: '13:00 Lunch Rush' },
    { hour: 17, label: '17:00 Retail Transition' },
    { hour: 21, label: '21:00 Prime Dessert Peak' }
  ];

  return (
    <div className="observatory-card rounded-t-xl border-b-0 border-x-0 border-t border-[#DCE3EC] px-6 py-3 select-none shadow-2xl bg-white/95 backdrop-blur flex flex-col space-y-2">
      {/* Top Row: Play/Pause, Active Time & Live Footfall Readout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlayingHour && setIsPlayingHour(!isPlayingHour)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
              isPlayingHour
                ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-300'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title={isPlayingHour ? 'Pause Diurnal Animation' : 'Auto-Play 24-Hour Diurnal Dynamics'}
          >
            {isPlayingHour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-900 font-extrabold text-base">
              {activeHour.toString().padStart(2, '0')}:00
            </span>
            <span className="text-slate-400 text-xs font-semibold">
              ({activeHour < 12 ? `${activeHour} AM` : activeHour === 12 ? '12 PM' : `${activeHour - 12} PM`})
            </span>
          </div>

          {/* Phase Badge */}
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-tight inline-flex items-center gap-1.5 border ${
            isPeak
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {isPeak && <Flame className="w-3 h-3 text-red-600 inline" />}
            {isPeak ? 'PRIME EVENING DESSERT WINDOW (41% DAILY VOLUME)' : 'STANDARD COMMERCIAL FLOW'}
          </span>
        </div>

        {/* Live Indiranagar Aggregate Footfall */}
        <div className="flex items-center gap-2 font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <Footprints className="w-4 h-4 text-red-600" />
          <div>
            <span className="text-[9px] text-slate-500 uppercase block">Indiranagar Regional Flow:</span>
            <span className="text-sm font-extrabold text-red-700 font-mono">
              ~{currentTotalRate.toLocaleString()} pedestrians / hour
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: 24-Hour Slider with Key Markers */}
      <div className="flex items-center space-x-3 pt-1">
        <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">00:00</span>
        <div className="relative grow">
          <input
            type="range"
            min="0"
            max="23"
            value={activeHour}
            onChange={(e) => setActiveHour && setActiveHour(parseInt(e.target.value))}
            className="w-full accent-red-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
          {/* Quick Click Phase Buttons */}
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
            {keyPhases.map(p => (
              <button
                key={p.hour}
                onClick={() => setActiveHour && setActiveHour(p.hour)}
                className={`hover:text-slate-900 transition-colors ${
                  activeHour === p.hour ? 'text-red-700 font-bold' : ''
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">23:00</span>
      </div>
    </div>
  );
}
