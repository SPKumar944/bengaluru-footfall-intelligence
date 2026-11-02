import React from 'react';
import { 
  Layers, 
  Eye, 
  ShieldAlert, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Navigation, 
  Building2, 
  MapPin, 
  Coffee, 
  Car, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function LayerSwitcherDock({
  layerConfig,
  setLayerConfig,
  infraCategoryFilter,
  setInfraCategoryFilter
}) {
  const toggle = (key) => {
    setLayerConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const setMacroMode = (mode) => {
    setLayerConfig(prev => ({
      ...prev,
      macro1kmMode: prev.macro1kmMode === mode ? 'off' : mode
    }));
  };

  const infraCategories = [
    'All',
    'Railway Station',
    'Mall',
    'Cinema',
    'Bus Terminal',
    'Tourist Attraction',
    'Restaurant',
    'Auditorium',
    'Airport'
  ];

  return (
    <div className="w-80 glass-panel rounded-xl p-4 flex flex-col space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto text-xs font-sans">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#272F3E] pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="font-serif text-sm font-semibold tracking-wide text-white">
            Client Data Layers
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">8 Layers + Proxies</span>
      </div>

      {/* 1. 1km x 1km Macro Grids (Layers 1, 2, 3) */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-cyan-400" />
          1×1 km Macro Economic Grids
        </span>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
          <button
            onClick={() => setMacroMode('pop')}
            className={`p-2 rounded-lg text-left border transition-all ${
              layerConfig.macro1kmMode === 'pop'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-[#181F2C] border-[#272F3E] text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3 mb-1 text-cyan-400" />
            Layer 1: Demographics
          </button>

          <button
            onClick={() => setMacroMode('pci')}
            className={`p-2 rounded-lg text-left border transition-all ${
              layerConfig.macro1kmMode === 'pci'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-[#181F2C] border-[#272F3E] text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3 h-3 mb-1 text-emerald-400" />
            Layer 2: Per Capita Income
          </button>

          <button
            onClick={() => setMacroMode('fb')}
            className={`p-2 rounded-lg text-left border transition-all ${
              layerConfig.macro1kmMode === 'fb'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                : 'bg-[#181F2C] border-[#272F3E] text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3 h-3 mb-1 text-amber-400" />
            Layer 3: F&B Spend / UPI
          </button>

          <button
            onClick={() => setMacroMode('gap')}
            className={`p-2 rounded-lg text-left border transition-all ${
              layerConfig.macro1kmMode === 'gap'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                : 'bg-[#181F2C] border-[#272F3E] text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 mb-1 text-purple-400" />
            Unmet Demand Gap
          </button>
        </div>
      </div>

      {/* 2. 150m x 150m Micro Mobility Grid (Layer 4) */}
      <div className="border-t border-[#272F3E] pt-3 space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-amber-400" />
          150×150 m Micro Mobility Grid
        </span>
        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Layer 4: Footfall & Mobility</span>
            <span className="text-[10px] text-slate-400 font-mono block">Annual Visitors & Travel Time (18 Corridors)</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showMobility150m}
            onChange={() => toggle('showMobility150m')}
            className="rounded accent-amber-400 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Customer Origin Flow Arcs</span>
            <span className="text-[10px] text-slate-400 font-mono block">"Where Visitors Come From" Desire Lines</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showOriginFlows}
            onChange={() => toggle('showOriginFlows')}
            className="rounded accent-cyan-400 cursor-pointer"
          />
        </label>
      </div>

      {/* 3. Polygons & Infrastructure Overlays */}
      <div className="border-t border-[#272F3E] pt-3 space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-emerald-400" />
          Polygons & Road Hierarchy
        </span>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Layer 7: Commercial Business Zones</span>
            <span className="text-[10px] text-slate-400 font-mono block">Retail Clusters, Shop & Building Counts</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showBusinessZones}
            onChange={() => toggle('showBusinessZones')}
            className="rounded accent-emerald-400 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Bonus: Road Traffic & Congestion</span>
            <span className="text-[10px] text-slate-400 font-mono block">Evening Peak Speeds & Visibility Score</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showRoadTraffic}
            onChange={() => toggle('showRoadTraffic')}
            className="rounded accent-rose-400 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Catchment Isochrones (5/10/15m)</span>
            <span className="text-[10px] text-slate-400 font-mono block">Walk 375m, Drive 3.6km, Delivery 6.2km</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showIsochrones}
            onChange={() => toggle('showIsochrones')}
            className="rounded accent-blue-400 cursor-pointer"
          />
        </label>
      </div>

      {/* 4. Point Brand & Amenity Layers */}
      <div className="border-t border-[#272F3E] pt-3 space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-rose-400" />
          Point POI Stores & Amenities
        </span>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Layer 5: Competitor Stores</span>
            <span className="text-[10px] text-slate-400 font-mono block">Polar Bear (Cyan) vs Corner House/Naturals (Red)</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showCompetitors}
            onChange={() => toggle('showCompetitors')}
            className="rounded accent-rose-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Layer 6: Complementary Anchors</span>
            <span className="text-[10px] text-slate-400 font-mono block">Starbucks, Third Wave, Truffles, McDonald's</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showComplementary}
            onChange={() => toggle('showComplementary')}
            className="rounded accent-amber-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181F2C]/70 hover:bg-[#181F2C] border border-[#272F3E] cursor-pointer">
          <div>
            <span className="text-slate-200 font-medium block">Layer 8: Infrastructure Amenities</span>
            <span className="text-[10px] text-slate-400 font-mono block">Metro, Malls, Cinemas, Bus Terminals</span>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showInfra}
            onChange={() => toggle('showInfra')}
            className="rounded accent-cyan-500 cursor-pointer"
          />
        </label>

        {/* Category Filter for Layer 8 */}
        {layerConfig.showInfra && (
          <div className="pl-2 pt-1">
            <select
              value={infraCategoryFilter}
              onChange={(e) => setInfraCategoryFilter(e.target.value)}
              className="w-full bg-[#0E131E] border border-[#272F3E] text-slate-300 text-[11px] rounded px-2 py-1 font-mono focus:border-cyan-400 outline-none"
            >
              {infraCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All 8 Infrastructure Categories' : cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5. Polar Bear Cannibalization Shield Buffer */}
      <div className="border-t border-[#272F3E] pt-3">
        <label className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-950/60 cursor-pointer transition-colors">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-cyan-300 font-bold block text-xs">Polar Bear Cannibalization Shield</span>
              <span className="text-[10px] text-cyan-400/80 font-mono block">1.2 km Franchise Exclusion Buffer</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={layerConfig.showCannibalizationShield}
            onChange={() => toggle('showCannibalizationShield')}
            className="rounded accent-cyan-400 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
