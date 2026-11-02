import React from 'react';
import { Sliders, Eye, RefreshCw, Filter, Layers, Zap, Info } from 'lucide-react';

export default function LayerAndWeightControl({
  weights,
  setWeights,
  layers,
  setLayers,
  selectedBrand,
  setSelectedBrand,
  onResetWeights
}) {
  const handleWeightChange = (key, val) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const toggleLayer = (key) => {
    setLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const brands = [
    { id: 'all', label: 'All Brands (325)' },
    { id: 'tier1', label: 'Tier-1 Destination Chains' },
    { id: 'corner house', label: 'Corner House' },
    { id: 'natural', label: 'Natural Ice Cream' },
    { id: 'milano', label: 'Milano Ice Cream' },
    { id: 'polar bear', label: 'Polar Bear' },
    { id: 'baskin robbins', label: 'Baskin Robbins' },
    { id: 'tier2', label: 'Tier-2 Mass (Amul / Arun / Local)' }
  ];

  return (
    <div className="w-80 glass-panel rounded-xl p-4 flex flex-col space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto text-xs font-sans">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#272F3E] pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="font-serif text-sm font-semibold tracking-wide text-white">MCDA Weight Engine</h2>
        </div>
        <button
          onClick={onResetWeights}
          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          title="Reset to Baseline Model Weights"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Real-time Dynamic Sliders */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-mono text-slate-300">Population Weight (w₁)</span>
          <span className="font-mono font-semibold text-cyan-400">{(weights.pop * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={weights.pop}
          onChange={(e) => handleWeightChange('pop', e.target.value)}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between items-center text-[11px]">
          <span className="font-mono text-slate-300">Footfall & Dining Synergy (w₂)</span>
          <span className="font-mono font-semibold text-emerald-400">{(weights.footfall * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={weights.footfall}
          onChange={(e) => handleWeightChange('footfall', e.target.value)}
          className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between items-center text-[11px]">
          <span className="font-mono text-slate-300">Youth & Tech Affluence (w₃)</span>
          <span className="font-mono font-semibold text-amber-400">{(weights.youth * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={weights.youth}
          onChange={(e) => handleWeightChange('youth', e.target.value)}
          className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between items-center text-[11px]">
          <span className="font-mono text-slate-300">Saturation Penalty (w₄)</span>
          <span className="font-mono font-semibold text-rose-400">{(weights.compPenalty * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.6"
          step="0.05"
          value={weights.compPenalty}
          onChange={(e) => handleWeightChange('compPenalty', e.target.value)}
          className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="text-[10px] text-slate-400 font-mono italic pt-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400 inline shrink-0" />
          <span>Real-time client recalculation at 60 FPS</span>
        </div>
      </div>

      {/* Color Ramp Legend */}
      <div className="border-t border-[#272F3E] pt-3">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
          IMPI Potential Index Ramp
        </span>
        <div className="h-2.5 w-full rounded-md bg-gradient-to-r from-[#334155] via-[#06B6D4] to-[#F59E0B] shadow-inner" />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>0 (Low)</span>
          <span>50 (Moderate)</span>
          <span className="text-amber-400 font-semibold">100 (Prime)</span>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="border-t border-[#272F3E] pt-3 space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
          Spatial Layer Visibility
        </span>

        <label className="flex items-center justify-between p-2 rounded bg-[#181F2C]/60 hover:bg-[#181F2C] cursor-pointer transition-colors border border-[#222938]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-amber-500" />
            H3 Market Grid
          </span>
          <input
            type="checkbox"
            checked={layers.h3Grid}
            onChange={() => toggleLayer('h3Grid')}
            className="rounded accent-cyan-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded bg-[#181F2C]/60 hover:bg-[#181F2C] cursor-pointer transition-colors border border-[#222938]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Competitor Outlets
          </span>
          <input
            type="checkbox"
            checked={layers.competitors}
            onChange={() => toggleLayer('competitors')}
            className="rounded accent-rose-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded bg-[#181F2C]/60 hover:bg-[#181F2C] cursor-pointer transition-colors border border-[#222938]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            5/10/15-Min Isochrones
          </span>
          <input
            type="checkbox"
            checked={layers.isochrones}
            onChange={() => toggleLayer('isochrones')}
            className="rounded accent-emerald-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded bg-[#181F2C]/60 hover:bg-[#181F2C] cursor-pointer transition-colors border border-[#222938]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            Gravity Demand Arcs
          </span>
          <input
            type="checkbox"
            checked={layers.gravityArcs}
            onChange={() => toggleLayer('gravityArcs')}
            className="rounded accent-purple-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded bg-[#181F2C]/60 hover:bg-[#181F2C] cursor-pointer transition-colors border border-[#222938]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Synergy Footfall POIs
          </span>
          <input
            type="checkbox"
            checked={layers.synergyPois}
            onChange={() => toggleLayer('synergyPois')}
            className="rounded accent-amber-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Competitor Brand Filter */}
      <div className="border-t border-[#272F3E] pt-3">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2 flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-slate-400" />
          Filter Competitor Brands
        </span>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full bg-[#181F2C] border border-[#272F3E] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
        >
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
