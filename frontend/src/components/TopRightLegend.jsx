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
    <div className="observatory-card rounded-xl p-2.5 px-3 text-xs font-mono shadow-[0_1px_2px_rgba(13,21,33,0.04),0_10px_28px_-20px_rgba(13,21,33,0.18)] border border-ink-950/[0.1] min-w-[230px] bg-white/95 backdrop-blur-md select-none">
      <div className="flex items-center justify-between text-[10px] text-ink-500 uppercase tracking-wider mb-1.5 font-bold">
        <span className="flex items-center gap-1.5 text-ink-950">
          <span className="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-azure-400 via-azure-500 via-violet-500 to-ink-900 border border-ink-950/[0.2]" />
          Street Flow ({activeHour.toString().padStart(2, '0')}:00)
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${
          isPeak 
            ? 'bg-azure-500/[0.08] text-azure-700 border-azure-500/30' 
            : isNight 
            ? 'bg-paper-100 text-ink-600 border-ink-950/[0.08]' 
            : 'bg-paper-50 text-ink-700 border-ink-950/[0.1]'
        }`}>
          {isPeak ? 'Peak Traffic' : isNight ? 'Minimal' : 'Standard'}
        </span>
      </div>

      {/* Diurnal Thermal Gradient Bar */}
      <div className="h-2 w-full rounded-xs bg-gradient-to-r from-[#94A3B8] via-[#FACC15] via-[#F97316] to-[#DC2626] border border-ink-950/[0.15] shadow-2xs" />

      {/* Dynamic Range Labels */}
      <div className="flex justify-between text-[9px] text-ink-400 mt-1 font-mono">
        <span>{minRange}</span>
        <span className="text-ink-700 font-semibold">{midRange}</span>
        <span className="text-azure-700 font-bold">{maxRange}</span>
      </div>

      {/* Geographic Coordinates & Zoom Readout */}
      <div className="flex items-center justify-between text-[9px] text-ink-400 pt-1.5 mt-1.5 border-t border-ink-950/[0.08]">
        <span>Lat: {viewState.latitude.toFixed(4)}°N</span>
        <span>Lon: {viewState.longitude.toFixed(4)}°E</span>
        <span className="text-ink-950 font-bold font-mono">Z: {viewState.zoom.toFixed(1)}</span>
      </div>
    </div>
  );
}
