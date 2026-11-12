import React, { useState } from 'react';
import { FOOTFALL_INDEX_TIERS } from '../utils/footfallFormatters';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function TopRightLegend({
  viewState,
  activeHour = 21,
  activeDay = 'saturday',
  activeDayType = 'weekend',
  selectedFootfallRange = 'ALL',
  onSelectFootfallRange
}) {
  const [showFullScale, setShowFullScale] = useState(false);
  const [hoveredTier, setHoveredTier] = useState(null);

  const isPeak = activeHour >= 19 && activeHour <= 23;
  const isNight = activeHour <= 5;
  const activeSelectedTier = FOOTFALL_INDEX_TIERS.find(t => t.displayLevel === selectedFootfallRange);
  const dayDisplay = activeDay ? activeDay.slice(0, 3).toUpperCase() : (activeDayType === 'weekend' ? 'WKND' : 'WKD');

  return (
    <div className="observatory-card rounded-xl p-2.5 px-3 text-xs font-mono shadow-[0_1px_2px_rgba(13,21,33,0.04),0_10px_28px_-20px_rgba(13,21,33,0.18)] border border-ink-950/[0.1] min-w-[270px] max-w-[310px] bg-white/95 backdrop-blur-md select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px] text-ink-500 uppercase tracking-wider mb-2 font-bold">
        <span className="flex items-center gap-1.5 text-ink-950">
          <Layers className="w-3.5 h-3.5 text-azure-600" />
          <span>Road Footfall Index</span>
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${
          isPeak 
            ? 'bg-azure-500/[0.08] text-azure-700 border-azure-500/30' 
            : isNight 
            ? 'bg-paper-100 text-ink-600 border-ink-950/[0.08]' 
            : 'bg-paper-50 text-ink-700 border-ink-950/[0.1]'
        }`}>
          {activeHour.toString().padStart(2, '0')}:00 {dayDisplay}
        </span>
      </div>

      {/* 1–10+ Segmented Color Ramp Bar */}
      <div>
        <div className="flex items-center justify-between text-[9px] font-bold text-ink-500 mb-1">
          <span>Click tier to filter: 1</span>
          <span className="text-azure-700">10+ (Peak)</span>
        </div>

        <div className="grid grid-cols-11 gap-0.5 p-0.5 bg-paper-100 rounded-md border border-ink-950/[0.12] shadow-2xs">
          {FOOTFALL_INDEX_TIERS.map((tier) => {
            const isHovered = hoveredTier?.level === tier.level;
            const isSelected = selectedFootfallRange === tier.displayLevel;

            return (
              <div
                key={tier.level}
                onClick={() => {
                  if (onSelectFootfallRange) {
                    onSelectFootfallRange(isSelected ? 'ALL' : tier.displayLevel);
                  }
                }}
                onMouseEnter={() => setHoveredTier(tier)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{ backgroundColor: tier.hex }}
                className={`h-6 rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                  isSelected
                    ? 'scale-110 z-20 shadow-md ring-2 ring-ink-950'
                    : isHovered
                    ? 'scale-110 z-10 shadow-sm ring-1 ring-ink-950/60'
                    : 'hover:opacity-90'
                }`}
                title={`Click to filter Index ${tier.displayLevel || tier.level}/10: ${tier.label} (${tier.rangeLabel})`}
              >
                <span 
                  style={{ color: tier.textColor || '#ffffff' }}
                  className="text-[9px] font-mono font-black drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.3)]"
                >
                  {tier.displayLevel || tier.level}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Selection or Hover Dynamic Callout */}
        {activeSelectedTier ? (
          <div 
            className="mt-1.5 p-1 px-2 rounded border text-[9.5px] font-mono flex items-center justify-between transition-all"
            style={{ 
              backgroundColor: `${activeSelectedTier.hex}18`, 
              borderColor: `${activeSelectedTier.hex}60` 
            }}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span 
                className="w-4 h-4 rounded font-black text-[9px] flex items-center justify-center shrink-0"
                style={{ 
                  backgroundColor: activeSelectedTier.hex,
                  color: activeSelectedTier.textColor || '#ffffff'
                }}
              >
                {activeSelectedTier.displayLevel}
              </span>
              <span className="font-bold text-ink-950 truncate">
                Level {activeSelectedTier.displayLevel} in Radius Circle
              </span>
            </div>
            <button
              onClick={() => onSelectFootfallRange && onSelectFootfallRange('ALL')}
              className="text-[9px] text-ink-600 hover:text-ink-950 font-bold ml-1 cursor-pointer shrink-0"
              title="Clear level filter"
            >
              Clear ✕
            </button>
          </div>
        ) : hoveredTier ? (
          <div 
            className="mt-1.5 p-1 px-2 rounded border text-[9.5px] font-mono flex items-center justify-between transition-all"
            style={{ 
              backgroundColor: `${hoveredTier.hex}14`, 
              borderColor: `${hoveredTier.hex}50` 
            }}
          >
            <div className="flex items-center gap-1.5">
              <span 
                className="w-4 h-4 rounded font-black text-[9px] flex items-center justify-center shrink-0"
                style={{ 
                  backgroundColor: hoveredTier.hex,
                  color: hoveredTier.textColor || '#ffffff'
                }}
              >
                {hoveredTier.displayLevel || hoveredTier.level}
              </span>
              <span className="font-bold text-ink-950 truncate">{hoveredTier.label}</span>
            </div>
            <span className="font-extrabold text-ink-900 shrink-0">{hoveredTier.rangeLabel}</span>
          </div>
        ) : (
          <div className="flex justify-between text-[8.5px] text-ink-400 mt-1 font-mono">
            <span>&lt; 50/hr</span>
            <span>650 – 900</span>
            <span className="text-azure-700 font-bold">2,350+/hr</span>
          </div>
        )}
      </div>

      {/* Toggle Full Index Guide Button */}
      <button
        onClick={() => setShowFullScale(prev => !prev)}
        className="mt-2 w-full py-1 px-2 rounded bg-paper-50 hover:bg-paper-100 border border-ink-950/[0.08] text-[9px] text-ink-600 font-semibold flex items-center justify-between cursor-pointer transition-colors"
      >
        <span>{showFullScale ? 'Hide Scale Guide' : 'View 1–10+ Index Guide'}</span>
        {showFullScale ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded 11-Tier Details Drawer */}
      {showFullScale && (
        <div className="mt-2 pt-2 border-t border-ink-950/[0.08] space-y-1 max-h-48 overflow-y-auto pr-0.5">
          {FOOTFALL_INDEX_TIERS.map((tier) => (
            <div 
              key={tier.level}
              className="flex items-center justify-between text-[9px] font-mono p-1 rounded hover:bg-paper-50"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span 
                  className="w-4 h-4 rounded text-[8.5px] font-black flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: tier.hex,
                    color: tier.textColor || '#ffffff'
                  }}
                >
                  {tier.displayLevel || tier.level}
                </span>
                <span className="font-bold text-ink-800 truncate">{tier.label}</span>
              </div>
              <span className="text-ink-500 font-semibold shrink-0 pl-1">{tier.rangeLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pocket Category Legend Guide */}
      <div className="flex items-center justify-between text-[9px] pt-1.5 mt-2 border-t border-ink-950/[0.08] text-ink-600 font-semibold">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/30 border border-amber-600 inline-block" />
          <span>Commercial Hubs</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/30 border border-indigo-600 inline-block" />
          <span>Residential Pockets</span>
        </span>
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
