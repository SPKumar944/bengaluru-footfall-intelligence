import React, { useRef } from 'react';
import { Play, Pause, Clock, Footprints, ChevronLeft, ChevronRight } from 'lucide-react';

const HOURLY_FLOW_PROFILE = [
  { hour: 0, flow: 540, phase: 'Late Night Transit' },
  { hour: 1, flow: 260, phase: 'Quiet Night Hours' },
  { hour: 2, flow: 130, phase: 'Quiet Night Hours' },
  { hour: 3, flow: 90, phase: 'Quiet Night Hours' },
  { hour: 4, flow: 120, phase: 'Quiet Night Hours' },
  { hour: 5, flow: 280, phase: 'Early Morning Transit' },
  { hour: 6, flow: 750, phase: 'Morning Transit Opening' },
  { hour: 7, flow: 1850, phase: 'Morning Transit Commute' },
  { hour: 8, flow: 3900, phase: 'Morning Commercial Flow' },
  { hour: 9, flow: 4800, phase: 'Morning Retail Activation' },
  { hour: 10, flow: 3700, phase: 'Commercial Daytime' },
  { hour: 11, flow: 3400, phase: 'Commercial Daytime' },
  { hour: 12, flow: 4400, phase: 'Lunch Period' },
  { hour: 13, flow: 5100, phase: 'Lunch Peak Rush' },
  { hour: 14, flow: 4100, phase: 'Afternoon Retail' },
  { hour: 15, flow: 3500, phase: 'Afternoon Retail' },
  { hour: 16, flow: 4200, phase: 'Evening Transition' },
  { hour: 17, flow: 5400, phase: 'Evening Commute Transit' },
  { hour: 18, flow: 6800, phase: 'High Street Evening Demand' },
  { hour: 19, flow: 7900, phase: 'Prime Evening Peak Window' },
  { hour: 20, flow: 8540, phase: 'Prime Evening Peak Window' },
  { hour: 21, flow: 8850, phase: 'Prime Evening Dessert Peak (41% Volume)' },
  { hour: 22, flow: 7200, phase: 'Late Evening Dining' },
  { hour: 23, flow: 4500, phase: 'Late Night Commercial Winding' }
];

// Returns thermal bar color based on hour flow
function getBarColor(hour) {
  if (hour <= 4) return '#94A3B8'; // Cool slate
  if (hour <= 7) return '#CBD5E1'; // Soft gray-blue
  if (hour <= 11) return '#EAB308'; // Golden yellow
  if (hour <= 17) return '#F97316'; // Radiant orange
  if (hour <= 22) return '#DC2626'; // Incandescent crimson red
  return '#EA580C'; // Warm orange
}

export default function BottomTransectBar({
  activeHour = 21,
  setActiveHour,
  activeDayType = 'weekend',
  isPlayingHour = false,
  setIsPlayingHour
}) {
  const containerRef = useRef(null);
  const isPeak = activeHour >= 19 && activeHour <= 23;
  const mult = activeDayType === 'weekend' ? 1.35 : 0.85;

  const currentProfile = HOURLY_FLOW_PROFILE[activeHour] || HOURLY_FLOW_PROFILE[21];
  const currentTotalRate = Math.round(currentProfile.flow * mult);
  const maxProfileFlow = Math.max(...HOURLY_FLOW_PROFILE.map(p => p.flow));

  // Wheel / Trackpad Scroll handler to smoothly change time
  const handleWheel = (e) => {
    if (!setActiveHour) return;
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 6) return;
    if (delta > 0) {
      setActiveHour(prev => (prev + 1) % 24);
    } else {
      setActiveHour(prev => (prev - 1 + 24) % 24);
    }
  };

  const keyPhases = [
    { hour: 3, label: '03:00 Night Quiet' },
    { hour: 8, label: '08:00 Morning Transit' },
    { hour: 13, label: '13:00 Lunch Rush' },
    { hour: 17, label: '17:00 Evening Transition' },
    { hour: 21, label: '21:00 Prime Dessert Peak' }
  ];

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="observatory-card rounded-t-xl border-b-0 border-x-0 border-t border-[#DCE3EC] px-4 md:px-6 py-2.5 select-none shadow-2xl bg-white/95 backdrop-blur flex flex-col space-y-2 transition-all"
      title="Scroll trackpad / mouse wheel horizontally or vertically here to scrub time"
    >
      {/* Top Header Row: Controls, Active Time Readout & Live Flow Metrics */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Play/Pause, Step Buttons, Time Display */}
        <div className="flex items-center space-x-2">
          {/* Step Back (-1h) */}
          <button
            onClick={() => setActiveHour && setActiveHour(prev => (prev - 1 + 24) % 24)}
            className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition shadow-2xs"
            title="Step Back 1 Hour"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlayingHour && setIsPlayingHour(!isPlayingHour)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition shadow-2xs ${
              isPlayingHour
                ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-300'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title={isPlayingHour ? 'Pause 24-Hour Timeline' : 'Play Diurnal Timeline Loop'}
          >
            {isPlayingHour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Step Forward (+1h) */}
          <button
            onClick={() => setActiveHour && setActiveHour(prev => (prev + 1) % 24)}
            className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition shadow-2xs"
            title="Step Forward 1 Hour"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-1.5 font-mono ml-1">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-slate-900 font-extrabold text-sm md:text-base">
              {activeHour.toString().padStart(2, '0')}:00
            </span>
            <span className="text-slate-500 text-xs font-semibold hidden sm:inline">
              ({activeHour < 12 ? `${activeHour === 0 ? 12 : activeHour} AM` : activeHour === 12 ? '12 PM' : `${activeHour - 12} PM`})
            </span>
          </div>

          {/* Phase Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border hidden md:inline-flex items-center ${
            isPeak
              ? 'bg-red-50 text-red-700 border-red-300'
              : activeHour <= 5
              ? 'bg-slate-100 text-slate-600 border-slate-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            {currentProfile.phase}
          </span>
        </div>

        {/* Center / Hint: Scroller Indicator */}
        <div className="hidden lg:flex items-center text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          <span>Scroll / Scrub to change time & footfall intensity</span>
        </div>

        {/* Right: Live Corridor Flow Metric */}
        <div className="flex items-center gap-2 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          <Footprints className="w-4 h-4 text-red-600" />
          <div>
            <span className="text-[9px] text-slate-500 uppercase block leading-none">Corridor Hourly Flow:</span>
            <span className="text-xs md:text-sm font-extrabold text-red-700 font-mono leading-tight">
              ~{currentTotalRate.toLocaleString()} visitors / hr
            </span>
          </div>
        </div>
      </div>

      {/* Middle: 24-Hour Diurnal Interactive Histogram Scroller */}
      <div className="flex items-end gap-1 h-9 px-1 pt-1 bg-slate-50/80 rounded-lg border border-slate-200">
        {HOURLY_FLOW_PROFILE.map((item) => {
          const isSelected = item.hour === activeHour;
          const barHeightPercent = Math.max(18, Math.round((item.flow / maxProfileFlow) * 100));
          const color = getBarColor(item.hour);

          return (
            <div
              key={item.hour}
              onClick={() => setActiveHour && setActiveHour(item.hour)}
              className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group relative"
              title={`${item.hour.toString().padStart(2, '0')}:00 — ~${Math.round(item.flow * mult).toLocaleString()} pedestrians/hr (${item.phase})`}
            >
              {/* Active Hour Indicator Pin */}
              {isSelected && (
                <div className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-red-600 ring-2 ring-white z-10" />
              )}
              {/* Histogram Bar */}
              <div
                style={{
                  height: `${barHeightPercent}%`,
                  backgroundColor: color,
                  opacity: isSelected ? 1 : 0.65
                }}
                className={`w-full rounded-t-xs transition-all ${
                  isSelected ? 'ring-2 ring-slate-800 ring-offset-0.5 shadow-xs' : 'group-hover:opacity-90'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom: Range Slider Scroller with Key Phase Markers */}
      <div className="flex items-center space-x-2.5">
        <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">00:00</span>
        <div className="relative grow">
          <input
            type="range"
            min="0"
            max="23"
            value={activeHour}
            onChange={(e) => setActiveHour && setActiveHour(parseInt(e.target.value))}
            className="w-full accent-red-600 cursor-pointer h-2 bg-gradient-to-r from-slate-400 via-amber-400 via-orange-500 to-red-600 rounded-lg appearance-none opacity-90 hover:opacity-100 transition shadow-inner"
          />
          {/* Quick Click Phase Buttons */}
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-0.5">
            {keyPhases.map(p => (
              <button
                key={p.hour}
                onClick={() => setActiveHour && setActiveHour(p.hour)}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  activeHour === p.hour ? 'text-red-700 font-extrabold underline' : ''
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
