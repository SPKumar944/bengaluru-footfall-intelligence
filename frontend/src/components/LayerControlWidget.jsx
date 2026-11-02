import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Footprints, 
  CircleDot, 
  MapPin, 
  Store, 
  Check,
  Sparkles,
  Cpu,
  Building2,
  Users
} from 'lucide-react';

export default function LayerControlWidget({
  activeLayers,
  setActiveLayers,
  competitorsData,
  selectedBrandFilter = 'ALL',
  setSelectedBrandFilter,
  selectedCompetitor,
  onSelectCompetitor,
  kidsAttractionsData,
  selectedKidsCategory = 'ALL',
  setSelectedKidsCategory,
  selectedKidsAttraction,
  onSelectKidsAttraction
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Extract unique competitor brands and counts
  const competitorBrands = React.useMemo(() => {
    if (!competitorsData?.features) return [];
    const counts = {};
    competitorsData.features.forEach(f => {
      const b = f.properties?.brand;
      if (b) counts[b] = (counts[b] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [competitorsData]);

  // Stores corresponding to selected brand
  const correspondingStores = React.useMemo(() => {
    if (!competitorsData?.features) return [];
    if (selectedBrandFilter === 'ALL') return competitorsData.features;
    return competitorsData.features.filter(f => f.properties?.brand === selectedBrandFilter);
  }, [competitorsData, selectedBrandFilter]);

  // Extract unique kids attraction categories and counts
  const kidsCategories = React.useMemo(() => {
    if (!kidsAttractionsData?.features) return [];
    const counts = {};
    kidsAttractionsData.features.forEach(f => {
      const c = f.properties?.category;
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [kidsAttractionsData]);

  // Attractions corresponding to selected kids category
  const correspondingKidsAttractions = React.useMemo(() => {
    if (!kidsAttractionsData?.features) return [];
    if (selectedKidsCategory === 'ALL') return kidsAttractionsData.features;
    return kidsAttractionsData.features.filter(f => f.properties?.category === selectedKidsCategory);
  }, [kidsAttractionsData, selectedKidsCategory]);

  const totalKidsCount = kidsAttractionsData?.features?.length || 116;

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="observatory-card rounded-xl p-2.5 text-xs font-mono shadow-xl border border-slate-300 bg-white/95 backdrop-blur w-72 sm:w-80 transition-all select-none max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header / Collapse Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-1.5 border-b border-slate-200"
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

      {/* Layer Checkboxes & Controls */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Layer 1: Street Footfall Network */}
          <div 
            onClick={() => toggleLayer('streetFootfall')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
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
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
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
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
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

          {/* Layer 4: Competitor Parlors with In-Panel Brand & Store Selector */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.competitors 
                ? 'bg-purple-50/80 border-purple-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {/* Clickable Header to Toggle Competitor Layer */}
            <div 
              onClick={() => toggleLayer('competitors')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.competitors 
                  ? 'bg-purple-600 border-purple-700 text-white' 
                  : 'bg-white border-slate-300'
              }`}>
                {activeLayers.competitors && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-slate-900">
                    <Store className="w-3 h-3 text-purple-600" />
                    Competitor Parlors (108)
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-white" title="Corner House" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" title="Naturals" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white" title="Polar Bear" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Corner House, Naturals, Polar Bear, Milano...
                </p>
              </div>
            </div>

            {/* When Competitor Layer is enabled, show the Brand and Store dropdowns right here */}
            {activeLayers.competitors && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-purple-200 space-y-2 text-xs"
              >
                {/* 1. Brand Filter Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 mb-1">
                    <span>Brand Filter:</span>
                    {selectedBrandFilter !== 'ALL' && (
                      <button
                        onClick={() => setSelectedBrandFilter && setSelectedBrandFilter('ALL')}
                        className="text-[9px] text-purple-600 hover:text-purple-800 underline font-normal cursor-pointer"
                      >
                        Reset All (108)
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter && setSelectedBrandFilter(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded px-2 py-1.5 text-xs font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Competitor Brands (108 Outlets)</option>
                    {competitorBrands.map(b => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.count} outlets)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Corresponding Stores for Selected Brand */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    {selectedBrandFilter === 'ALL' 
                      ? 'Select Store Location (108):' 
                      : `${selectedBrandFilter} Stores (${correspondingStores.length}):`}
                  </label>
                  <select
                    value={selectedCompetitor?.properties?.store_id || ''}
                    onChange={(e) => {
                      const match = competitorsData?.features?.find(f => f.properties?.store_id === e.target.value);
                      if (match && onSelectCompetitor) {
                        onSelectCompetitor(match);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">
                      {selectedBrandFilter === 'ALL' 
                        ? 'Select parlor location...' 
                        : `Select ${selectedBrandFilter} outlet...`}
                    </option>
                    {correspondingStores.map(f => (
                      <option key={f.properties?.store_id} value={f.properties?.store_id}>
                        {f.properties?.store_name} — {f.properties?.locality} (Rating: {f.properties?.rating_proxy})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Selected Competitor Snapshot */}
                {selectedCompetitor && (
                  <div className="bg-purple-100/80 border border-purple-300 rounded-lg p-2 text-[10px] text-purple-950 space-y-1">
                    <div className="font-extrabold flex items-center justify-between">
                      <span className="truncate">{selectedCompetitor.properties?.store_name}</span>
                      <span className="text-emerald-700 shrink-0 font-bold ml-1">Rating: {selectedCompetitor.properties?.rating_proxy}</span>
                    </div>
                    <div className="text-slate-600 line-clamp-1">{selectedCompetitor.properties?.address}</div>
                    <div className="text-purple-800 font-bold flex justify-between pt-0.5 border-t border-purple-200">
                      <span>Monthly Volume:</span>
                      <span>~{selectedCompetitor.properties?.monthly_cup_volume_est?.toLocaleString()} cups/mo</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section Divider: Market Influencers */}
          <div className="pt-2 pb-0.5 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Market Influencers & Family Drivers
            </span>
          </div>

          {/* Layer 5: Kids & Family Footfall Magnets with Embedded Category & Location Filter */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.kidsAttractions 
                ? 'bg-pink-50/80 border-pink-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {/* Clickable Header to Toggle Kids Layer */}
            <div 
              onClick={() => toggleLayer('kidsAttractions')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.kidsAttractions 
                  ? 'bg-pink-600 border-pink-700 text-white' 
                  : 'bg-white border-slate-300'
              }`}>
                {activeLayers.kidsAttractions && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-slate-900">
                    <Sparkles className="w-3 h-3 text-pink-600" />
                    Kids & Family Magnets ({totalKidsCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" title="Hamleys & Toys" />
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-white" title="Arcades & Play" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" title="Theatres" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" title="Parks & Lakes" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Hamleys, Arcades, Theatres, Parks & Zoos
                </p>
              </div>
            </div>

            {/* When Kids Layer is enabled, show Category tabs and Attraction dropdown right here */}
            {activeLayers.kidsAttractions && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-pink-200 space-y-2 text-xs"
              >
                {/* 1. Category Filter Tabs / Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-pink-900 mb-1">
                    <span>Category Filter:</span>
                    {selectedKidsCategory !== 'ALL' && (
                      <button
                        onClick={() => setSelectedKidsCategory && setSelectedKidsCategory('ALL')}
                        className="text-[9px] text-pink-600 hover:text-pink-800 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalKidsCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedKidsCategory}
                    onChange={(e) => setSelectedKidsCategory && setSelectedKidsCategory(e.target.value)}
                    className="w-full bg-white border border-pink-300 rounded px-2 py-1.5 text-xs font-bold text-pink-900 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Categories ({totalKidsCount} Hotspots)</option>
                    {kidsCategories.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Corresponding Attractions for Selected Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    {selectedKidsCategory === 'ALL' 
                      ? `Select Hotspot (${totalKidsCount}):` 
                      : `${selectedKidsCategory} (${correspondingKidsAttractions.length}):`}
                  </label>
                  <select
                    value={selectedKidsAttraction?.properties?.id || ''}
                    onChange={(e) => {
                      const match = kidsAttractionsData?.features?.find(f => f.properties?.id === e.target.value);
                      if (match && onSelectKidsAttraction) {
                        onSelectKidsAttraction(match);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">
                      {selectedKidsCategory === 'ALL' 
                        ? 'Select children hotspot location...' 
                        : `Select ${selectedKidsCategory} venue...`}
                    </option>
                    {correspondingKidsAttractions.map(f => (
                      <option key={f.properties?.id} value={f.properties?.id}>
                        {f.properties?.name} — {f.properties?.locality} (Synergy: {f.properties?.ice_cream_attraction_score}/100)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Selected Kids Attraction Snapshot */}
                {selectedKidsAttraction && (
                  <div className="bg-pink-100/80 border border-pink-300 rounded-lg p-2 text-[10px] text-pink-950 space-y-1">
                    <div className="font-extrabold flex items-center justify-between">
                      <span className="truncate">{selectedKidsAttraction.properties?.name}</span>
                      <span className="text-emerald-700 shrink-0 font-bold ml-1">
                        Synergy: {selectedKidsAttraction.properties?.ice_cream_attraction_score}/100
                      </span>
                    </div>
                    <div className="text-slate-600 line-clamp-1">{selectedKidsAttraction.properties?.address}</div>
                    <div className="text-pink-800 font-bold flex justify-between pt-0.5 border-t border-pink-200">
                      <span>Monthly Traffic:</span>
                      <span>~{selectedKidsAttraction.properties?.est_monthly_family_footfall?.toLocaleString()} / mo</span>
                    </div>
                    <div className="text-[9px] text-amber-900 font-medium">
                      Peak: {selectedKidsAttraction.properties?.peak_window}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Layer 6: Tech Parks & IT Campuses */}
          <div 
            onClick={() => toggleLayer('techParks')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.techParks 
                ? 'bg-sky-50/80 border-sky-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.techParks 
                ? 'bg-sky-600 border-sky-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.techParks && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-sky-600" />
                  Tech Parks & IT Campuses (95)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Corporate hubs & daytime dessert demand
              </p>
            </div>
          </div>

          {/* Layer 7: Commercial Office Footprints */}
          <div 
            onClick={() => toggleLayer('officeFootprints')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.officeFootprints 
                ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.officeFootprints 
                ? 'bg-indigo-600 border-indigo-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.officeFootprints && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  Office Footprints (3.1k)
                </span>
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/80 border border-indigo-600" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Commercial buildings & workplace density
              </p>
            </div>
          </div>

          {/* Layer 8: BBMP Ward Demographics */}
          <div 
            onClick={() => toggleLayer('wardDemographics')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.wardDemographics 
                ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.wardDemographics 
                ? 'bg-emerald-600 border-emerald-700 text-white' 
                : 'bg-white border-slate-300'
            }`}>
              {activeLayers.wardDemographics && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-emerald-600" />
                  Ward Demographics (369)
                </span>
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/70 border border-emerald-600" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                BBMP census population choropleth
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
