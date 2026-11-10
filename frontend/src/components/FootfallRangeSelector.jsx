import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, RotateCcw, CircleDot, Filter, Footprints } from 'lucide-react';
import { FOOTFALL_INDEX_TIERS, getFootfallTier } from '../utils/footfallFormatters';

export default function FootfallRangeSelector({
  selectedFootfallRange = 'ALL',
  onSelectFootfallRange,
  scopeToRadiusCircle = true,
  onToggleScopeToRadiusCircle,
  streetFootfallData,
  selectedApsaraStore,
  activeHour = 21,
  activeDayType = 'weekend',
  compact = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute road counts inside the 350m radius circle for each tier
  const tierCounts = useMemo(() => {
    const counts = {
      ALL: 0,
      HIGH_7_PLUS: 0
    };
    FOOTFALL_INDEX_TIERS.forEach(t => {
      counts[t.displayLevel] = 0;
    });

    if (!streetFootfallData?.features) return counts;

    const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
    const targetSerial = selectedApsaraStore?.serial_no;

    streetFootfallData.features.forEach(f => {
      // Must be within 380m radius circle
      if (f.properties.dist_to_store_m > 380) return;
      if (targetSerial && f.properties.serial_no !== targetSerial) return;

      counts.ALL++;

      const hrVal = f.properties.hourly_footfall?.[activeHour] || 100;
      const flow = Math.round(hrVal * mult);
      const tier = getFootfallTier(flow);

      counts[tier.displayLevel] = (counts[tier.displayLevel] || 0) + 1;
      if (tier.level >= 7) {
        counts.HIGH_7_PLUS++;
      }
    });

    return counts;
  }, [streetFootfallData, selectedApsaraStore?.serial_no, activeHour, activeDayType]);

  const activeTier = FOOTFALL_INDEX_TIERS.find(t => t.displayLevel === selectedFootfallRange);

  return (
    <div ref={dropdownRef} className="relative w-full text-xs font-mono select-none">
      {/* Dropdown Trigger Button */}
      <div className="flex items-center justify-between text-[10px] font-bold text-ink-950 mb-1">
        <span className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-azure-600" />
          <span>Footfall Level Filter:</span>
        </span>
        {selectedFootfallRange !== 'ALL' && (
          <button
            onClick={() => onSelectFootfallRange('ALL')}
            className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal flex items-center gap-0.5 cursor-pointer"
            title="Reset to all footfall levels"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset All
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full bg-white border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs ${
          isOpen ? 'ring-2 ring-azure-500/40 border-azure-500' : 'border-ink-950/[0.14] hover:border-ink-950/[0.3]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedFootfallRange === 'ALL' ? (
            <>
              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 bg-paper-100 border border-ink-950/[0.15]">
                <Footprints className="w-2.5 h-2.5 text-ink-700" />
              </div>
              <div className="truncate">
                <span className="font-bold text-ink-950 text-[11px]">All Footfall Levels</span>
                <span className="text-[9px] text-ink-500 ml-1.5">({tierCounts.ALL} roads in circle)</span>
              </div>
            </>
          ) : selectedFootfallRange === 'HIGH_7_PLUS' ? (
            <>
              <div 
                className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-black text-[9px] text-white shadow-2xs"
                style={{ background: 'linear-gradient(135deg, #a5d6a7, #ff7043, #d32f2f)' }}
              >
                7+
              </div>
              <div className="truncate">
                <span className="font-bold text-ink-950 text-[11px]">High Commercial (7+)</span>
                <span className="text-[9px] text-ink-500 ml-1.5">({tierCounts.HIGH_7_PLUS} in circle)</span>
              </div>
            </>
          ) : activeTier ? (
            <>
              <div
                className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-black text-[9px] shadow-2xs"
                style={{ backgroundColor: activeTier.hex, color: activeTier.textColor || '#ffffff' }}
              >
                {activeTier.displayLevel}
              </div>
              <div className="truncate">
                <span className="font-bold text-ink-950 text-[11px]">
                  Level {activeTier.displayLevel}: {activeTier.label}
                </span>
                <span className="text-[9px] text-ink-500 ml-1.5 font-normal">
                  ({activeTier.rangeLabel})
                </span>
              </div>
            </>
          ) : null}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Menu with full 11 Hex Colors */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white/98 backdrop-blur-md border border-ink-950/[0.16] rounded-xl shadow-[0_4px_24px_rgba(13,21,33,0.18)] max-h-72 overflow-y-auto p-1.5 space-y-1">
          {/* Option: All Levels */}
          <div
            onClick={() => {
              onSelectFootfallRange('ALL');
              setIsOpen(false);
            }}
            className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors text-[10px] ${
              selectedFootfallRange === 'ALL'
                ? 'bg-azure-50/80 text-azure-900 font-bold border border-azure-300'
                : 'hover:bg-paper-100 text-ink-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded bg-paper-100 border border-ink-950/[0.15] flex items-center justify-center text-[9px] font-black text-ink-700">
                ∞
              </div>
              <div>
                <div className="font-bold">All Footfall Levels</div>
                <div className="text-[8.5px] text-ink-400">Complete road network (Levels 1 to 10+)</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] text-ink-500 bg-paper-100 px-1.5 py-0.5 rounded font-mono">
                {tierCounts.ALL} roads
              </span>
              {selectedFootfallRange === 'ALL' && <Check className="w-3.5 h-3.5 text-azure-600 stroke-[3]" />}
            </div>
          </div>

          {/* Option: High Commercial 7+ */}
          <div
            onClick={() => {
              onSelectFootfallRange('HIGH_7_PLUS');
              setIsOpen(false);
            }}
            className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors text-[10px] ${
              selectedFootfallRange === 'HIGH_7_PLUS'
                ? 'bg-azure-50/80 text-azure-900 font-bold border border-azure-300'
                : 'hover:bg-paper-100 text-ink-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-2xs"
                style={{ background: 'linear-gradient(135deg, #a5d6a7, #ff7043, #d32f2f)' }}
              >
                7+
              </div>
              <div>
                <div className="font-bold">High Commercial Only (7+)</div>
                <div className="text-[8.5px] text-ink-400">900+ / hr • Active dining & shopping spines</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] text-ink-500 bg-paper-100 px-1.5 py-0.5 rounded font-mono">
                {tierCounts.HIGH_7_PLUS}
              </span>
              {selectedFootfallRange === 'HIGH_7_PLUS' && <Check className="w-3.5 h-3.5 text-azure-600 stroke-[3]" />}
            </div>
          </div>

          <div className="pt-1 pb-0.5 px-2 text-[8.5px] font-bold text-ink-400 uppercase tracking-wider border-t border-ink-950/[0.08]">
            11-Color Sequential Thermal Ramp
          </div>

          {/* 11 Individual Footfall Tiers with exact hex colors */}
          {FOOTFALL_INDEX_TIERS.map((tier) => {
            const isSelected = selectedFootfallRange === tier.displayLevel;
            const count = tierCounts[tier.displayLevel] || 0;

            return (
              <div
                key={tier.level}
                onClick={() => {
                  onSelectFootfallRange(tier.displayLevel);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors text-[10px] ${
                  isSelected
                    ? 'bg-azure-50/90 text-ink-950 font-bold border border-azure-300 shadow-2xs'
                    : 'hover:bg-paper-100 text-ink-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Distinct Color Swatch Pill */}
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-black text-[9px] shadow-2xs ring-1 ring-black/10"
                    style={{
                      backgroundColor: tier.hex,
                      color: tier.textColor || '#ffffff'
                    }}
                  >
                    {tier.displayLevel}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold">Level {tier.displayLevel}: {tier.label}</span>
                    </div>
                    <div className="text-[8.5px] text-ink-400 truncate">
                      {tier.rangeLabel} • {tier.tag}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      count > 0 
                        ? 'bg-paper-100 text-ink-800 border border-ink-950/[0.08]' 
                        : 'text-ink-400 opacity-60'
                    }`}
                  >
                    {count} {count === 1 ? 'road' : 'roads'}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-azure-600 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Radius Circle Scoping Toggle */}
      <div className="mt-2 pt-2 border-t border-ink-950/[0.08] flex items-center justify-between text-[10px]">
        <label 
          className="flex items-center gap-1.5 text-ink-800 font-semibold cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleScopeToRadiusCircle) onToggleScopeToRadiusCircle(!scopeToRadiusCircle);
          }}
        >
          <input
            type="checkbox"
            checked={scopeToRadiusCircle}
            onChange={(e) => onToggleScopeToRadiusCircle && onToggleScopeToRadiusCircle(e.target.checked)}
            className="w-3.5 h-3.5 accent-azure-600 rounded cursor-pointer"
          />
          <CircleDot className="w-3 h-3 text-amber-600" />
          <span>Show inside 350m radius circle</span>
        </label>
        <span className="text-[9px] text-ink-500 font-mono">
          {selectedApsaraStore ? selectedApsaraStore.locality : '350m Walkshed'}
        </span>
      </div>

      {/* Active Filter Status Banner */}
      {selectedFootfallRange !== 'ALL' && (
        <div 
          className="mt-1.5 p-1.5 px-2 rounded-lg border text-[9.5px] font-mono flex items-center justify-between"
          style={{
            backgroundColor: activeTier ? `${activeTier.hex}15` : '#f1f5f9',
            borderColor: activeTier ? `${activeTier.hex}60` : '#cbd5e1'
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {activeTier && (
              <span
                className="w-3.5 h-3.5 rounded text-[8.5px] font-black flex items-center justify-center shrink-0"
                style={{ backgroundColor: activeTier.hex, color: activeTier.textColor || '#ffffff' }}
              >
                {activeTier.displayLevel}
              </span>
            )}
            <span className="font-bold text-ink-950 truncate">
              {tierCounts[selectedFootfallRange] || 0} roads in radius circle
            </span>
          </div>
          <button
            onClick={() => onSelectFootfallRange('ALL')}
            className="text-[9px] text-ink-600 hover:text-ink-950 font-bold ml-1 cursor-pointer shrink-0"
          >
            Clear ✕
          </button>
        </div>
      )}
    </div>
  );
}
