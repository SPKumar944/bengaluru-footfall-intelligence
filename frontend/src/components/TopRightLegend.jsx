import React from 'react';

export default function TopRightLegend({
  viewState,
  activeHour = 21,
  activeDayType = 'weekend'
}) {
  const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
  const isPeak = activeHour >= 19 && activeHour <= 23;
  const isNight = activeHour <= 5;

  let minRange = '< 40';
  let midRange = '300 - 600';
  let maxRange = '> 2,500';

  if (isNight) {
    minRange = '< 15';
    midRange = '~35';
    maxRange = '~90 / hr';
  } else if (activeHour <= 10) {
    minRange = '~100';
    midRange = '~400';
    maxRange = '~2.8k / hr';
  } else if (isPeak) {
    minRange = '~250';
    midRange = '~900';
    maxRange = '> 4.5k / hr';
  }

  return (
    <div className="observatory-card rounded-lg p-2.5 px-3 text-xs font-mono shadow-md border border-[#DCE3EC] min-w-[230px] bg-white/95 backdrop-blur select-none">
      <div className="flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-wider mb-1.5 font-bold">
        <span className="flex items-center gap-1.5 text-slate-800">
          <span className="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-[#94A3B8] via-[#FACC15] via-[#F97316] to-[#DC2626] border border-slate-300" />
          Street Flow ({activeHour.toString().padStart(2, '0')}:00)
        </span>
        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
          isPeak 
            ? 'bg-red-50 text-red-700 border-red-300' 
            : isNight 
            ? 'bg-slate-100 text-slate-600 border-slate-300' 
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          {isPeak ? 'Prime Peak' : isNight ? 'Night Minimal' : 'Standard'}
        </span>
      </div>

      {/* Diurnal Thermal Gradient Bar (Cool Slate -> Lemon Yellow -> Orange -> Crimson Red) */}
      <div className="h-2 w-full rounded-xs bg-gradient-to-r from-[#94A3B8] via-[#FACC15] via-[#F97316] to-[#DC2626] border border-slate-300 shadow-2xs" />

      {/* Dynamic Range Labels */}
      <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
        <span>{minRange}</span>
        <span className="text-amber-700 font-semibold">{midRange}</span>
        <span className="text-red-700 font-bold">{maxRange}</span>
      </div>

      {/* Geographic Coordinates & Zoom Readout */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1.5 mt-1.5 border-t border-slate-200">
        <span>Lat: {viewState.latitude.toFixed(4)}°N</span>
        <span>Lon: {viewState.longitude.toFixed(4)}°E</span>
        <span className="text-slate-800 font-bold">Z: {viewState.zoom.toFixed(1)}</span>
      </div>
    </div>
  );
}
