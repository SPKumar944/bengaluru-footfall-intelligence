import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Footprints, 
  CircleDot, 
  MapPin, 
  Store, 
  Check 
} from 'lucide-react';

export default function LayerControlWidget({
  activeLayers,
  setActiveLayers
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="observatory-card rounded-xl p-2.5 text-xs font-mono shadow-xl border border-slate-300 bg-white/95 backdrop-blur min-w-[240px] transition-all">
      {/* Header / Collapse Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-1 border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-800" />
          <span className="font-bold text-slate-900 text-xs tracking-tight">DATA LAYERS</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
            {activeCount} Active
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-700 transition-colors p-0.5">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Layer Checkboxes */}
      {isExpanded && (
        <div className="mt-2 space-y-1.5">
          {/* Layer 1: Street Footfall Network */}
          <div 
            onClick={() => toggleLayer('streetFootfall')}
            className={`flex items-start gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all border ${
              activeLayers.streetFootfall 
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.streetFootfall 
                ? 'bg-amber-600 border-amber-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.streetFootfall && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Footprints className="w-3 h-3 text-red-600" />
                  Street Footfall Flow
                </span>
                <span className="w-8 h-1.5 rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                47k real roads • 24-hr diurnal flow
              </p>
            </div>
          </div>

          {/* Layer 2: 350m Catchments */}
          <div 
            onClick={() => toggleLayer('catchments')}
            className={`flex items-start gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all border ${
              activeLayers.catchments 
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.catchments 
                ? 'bg-amber-600 border-amber-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.catchments && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <CircleDot className="w-3 h-3 text-amber-600" />
                  350m Catchment Zones
                </span>
                <span className="w-3 h-3 rounded-full border border-amber-500 bg-amber-400/30" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                High-density pedestrian walksheds
              </p>
            </div>
          </div>

          {/* Layer 3: Apsara Stores */}
          <div 
            onClick={() => toggleLayer('apsaraStores')}
            className={`flex items-start gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all border ${
              activeLayers.apsaraStores 
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.apsaraStores 
                ? 'bg-amber-600 border-amber-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.apsaraStores && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-red-600" />
                  Apsara Outlets (13)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Apsara Ice Cream verified pins
              </p>
            </div>
          </div>

          {/* Layer 4: Competitor Parlors */}
          <div 
            onClick={() => toggleLayer('competitors')}
            className={`flex items-start gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all border ${
              activeLayers.competitors 
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.competitors 
                ? 'bg-amber-600 border-amber-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.competitors && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Store className="w-3 h-3 text-blue-600" />
                  Competitor Parlors (108)
                </span>
                <div className="flex -space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-white" title="Corner House" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" title="Naturals" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white" title="Polar Bear" />
                </div>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Corner House, Naturals, Milano, Stoner, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
