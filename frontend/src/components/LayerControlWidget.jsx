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
  Users,
  Hexagon,
  GraduationCap,
  UtensilsCrossed
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
  onSelectKidsAttraction,
  complementaryBrandsData,
  selectedComplementarySpectrum = 'ALL',
  setSelectedComplementarySpectrum,
  selectedComplementaryBrand,
  onSelectComplementaryBrand,
  educationPoisData,
  selectedEducationCategory = 'ALL',
  setSelectedEducationCategory,
  selectedEducationPoi,
  onSelectEducationPoi,
  demographicGender = 'all',
  setDemographicGender,
  demographicAge = 'all',
  setDemographicAge
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

  // Extract unique education POI categories and counts
  const educationCategories = React.useMemo(() => {
    if (!educationPoisData?.features) return [];
    const counts = {};
    educationPoisData.features.forEach(f => {
      const c = f.properties?.category;
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [educationPoisData]);

  // Institutions corresponding to selected education category
  const correspondingEducationPois = React.useMemo(() => {
    if (!educationPoisData?.features) return [];
    const list = selectedEducationCategory === 'ALL' 
      ? educationPoisData.features 
      : educationPoisData.features.filter(f => f.properties?.category === selectedEducationCategory);
    return [...list].sort((a, b) => (a.properties?.name || '').localeCompare(b.properties?.name || ''));
  }, [educationPoisData, selectedEducationCategory]);

  const totalEducationCount = educationPoisData?.features?.length || 102;

  // Extract unique complementary dining spectrum categories and counts
  const complementarySpectrums = React.useMemo(() => {
    if (!complementaryBrandsData?.features) return [];
    const counts = {};
    complementaryBrandsData.features.forEach(f => {
      const s = f.properties?.spectrum_category;
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [complementaryBrandsData]);

  // Venues corresponding to selected complementary spectrum category
  const correspondingComplementaryVenues = React.useMemo(() => {
    if (!complementaryBrandsData?.features) return [];
    const list = selectedComplementarySpectrum === 'ALL' 
      ? complementaryBrandsData.features 
      : complementaryBrandsData.features.filter(f => f.properties?.spectrum_category === selectedComplementarySpectrum);
    return [...list].sort((a, b) => (a.properties?.name || '').localeCompare(b.properties?.name || ''));
  }, [complementaryBrandsData, selectedComplementarySpectrum]);

  const totalComplementaryCount = complementaryBrandsData?.features?.length || 171;

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

          {/* Layer: Complementary Dining Brands (High Dessert Synergy Spectrum) */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.complementaryBrands 
                ? 'bg-orange-50/80 border-orange-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {/* Clickable Header to Toggle Complementary Brands */}
            <div 
              onClick={() => toggleLayer('complementaryBrands')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.complementaryBrands 
                  ? 'bg-orange-600 border-orange-700 text-white' 
                  : 'bg-white border-slate-300'
              }`}>
                {activeLayers.complementaryBrands && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-slate-900">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                    Complementary Brands ({totalComplementaryCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white" title="🚇 Metro & Transit" />
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 border border-white" title="🛍️ Malls & Retail" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" title="🎭 Cinemas & Auditoriums" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" title="🌟 Street Walkways" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white" title="🔥 Spicy Biryani" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Metro, Malls, Cinemas, Walkways, Biryani, Burgers & Pubs
                </p>
              </div>
            </div>

            {/* When Layer is enabled, show the Synergy Spectrum and Venue Selector */}
            {activeLayers.complementaryBrands && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-orange-200/80 space-y-2 text-xs"
              >
                {/* 1. Synergy Spectrum Pillar Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-orange-950 mb-1">
                    <span>Category / Hotspot Type:</span>
                    {selectedComplementarySpectrum !== 'ALL' && (
                      <button
                        onClick={() => setSelectedComplementarySpectrum && setSelectedComplementarySpectrum('ALL')}
                        className="text-[9px] text-orange-700 hover:text-orange-900 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalComplementaryCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedComplementarySpectrum}
                    onChange={(e) => setSelectedComplementarySpectrum && setSelectedComplementarySpectrum(e.target.value)}
                    className="w-full bg-white border border-orange-300 rounded px-2 py-1.5 text-xs font-bold text-orange-950 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Categories & Hotspots ({totalComplementaryCount} Venues)</option>
                    <option value="Metro Stations & Transit Terminals">🚇 Metro & Transit Terminals ({complementarySpectrums.find(s => s[0] === 'Metro Stations & Transit Terminals')?.[1] || 47})</option>
                    <option value="Shopping Malls & Retail Hubs">🛍️ Shopping Malls & Retail Hubs ({complementarySpectrums.find(s => s[0] === 'Shopping Malls & Retail Hubs')?.[1] || 18})</option>
                    <option value="Cinemas & Cultural Auditoriums">🎭 Cinemas & Cultural Auditoriums ({complementarySpectrums.find(s => s[0] === 'Cinemas & Cultural Auditoriums')?.[1] || 11})</option>
                    <option value="Street Walkways & Buzzing Hotspots">🌟 Street Walkways & Hotspots ({complementarySpectrums.find(s => s[0] === 'Street Walkways & Buzzing Hotspots')?.[1] || 14})</option>
                    <option value="Hot & Spicy Meals">🔥 Hot & Spicy Meals (Biryani) ({complementarySpectrums.find(s => s[0] === 'Hot & Spicy Meals')?.[1] || 21})</option>
                    <option value="Youth Fast Casual">🍔 Youth Fast Casual (Burgers & Pizza) ({complementarySpectrums.find(s => s[0] === 'Youth Fast Casual')?.[1] || 80})</option>
                    <option value="Late-Night Pubs & Breweries">🍺 Late-Night Pubs & Breweries ({complementarySpectrums.find(s => s[0] === 'Late-Night Pubs & Breweries')?.[1] || 17})</option>
                    <option value="Evening Tiffin & Heritage Cafes">☕ Evening Tiffin & Heritage Cafes ({complementarySpectrums.find(s => s[0] === 'Evening Tiffin & Heritage Cafes')?.[1] || 53})</option>
                  </select>
                </div>

                {/* 2. Visual Spectrum Pillar Explanation Badge */}
                <div className="p-1.5 rounded bg-white/90 border border-orange-200 text-[10px] space-y-0.5">
                  <div className="font-extrabold text-orange-950">
                    {selectedComplementarySpectrum === 'Metro Stations & Transit Terminals' ? '🚇 Commuter Transit & Quick-Grab Impulse' :
                     selectedComplementarySpectrum === 'Shopping Malls & Retail Hubs' ? '🛍️ All-Weather Family Leisure & Retail Footfall' :
                     selectedComplementarySpectrum === 'Cinemas & Cultural Auditoriums' ? '🎭 Pre/Post Show Crowd Spillover & Theatre Strolls' :
                     selectedComplementarySpectrum === 'Street Walkways & Buzzing Hotspots' ? '🌟 High-Density Pedestrian Strolls & Leisure Strolls' :
                     selectedComplementarySpectrum === 'Hot & Spicy Meals' ? '🔥 Capsaicin Relief & Milk Fat Need' :
                     selectedComplementarySpectrum === 'Youth Fast Casual' ? '🍔 Extended Hangout & Student Cohort' :
                     selectedComplementarySpectrum === 'Late-Night Pubs & Breweries' ? '🍺 Post-Alcohol Sweet Tooth & Midnight Craving' :
                     selectedComplementarySpectrum === 'Evening Tiffin & Heritage Cafes' ? '☕ Family Weekend Tradition & Evening Walkers' :
                     '⚡ High Dessert Synergy Landscape (8 Core Hub Pillars)'}
                  </div>
                  <p className="text-[9px] text-slate-600 leading-tight">
                    {selectedComplementarySpectrum === 'Metro Stations & Transit Terminals'
                      ? 'Namma metro stations, railway junctions & bus terminals funneling hundreds of thousands of commuters into grab-and-go dessert kiosks.' :
                     selectedComplementarySpectrum === 'Shopping Malls & Retail Hubs'
                      ? 'Destination shopping malls (Phoenix, Orion, Nexus, Mall of Asia) with massive weekend family shopping, multiplex and food court spillovers.' :
                     selectedComplementarySpectrum === 'Cinemas & Cultural Auditoriums'
                      ? 'Ranga Shankara, Chowdiah Hall & multiplex audiences pouring out after evening plays and concerts seeking post-performance dessert.' :
                     selectedComplementarySpectrum === 'Street Walkways & Buzzing Hotspots'
                      ? 'Church St, Commercial St, VV Puram & Gandhi Bazaar pedestrian walkways where strolling with an ice cream is the primary social activity.' :
                     selectedComplementarySpectrum === 'Hot & Spicy Meals' 
                      ? 'Fiery Andhra chilli & pepper gravies create biological casein/milk fat cravings to soothe TRPV1 oral receptors.' :
                     selectedComplementarySpectrum === 'Youth Fast Casual' 
                      ? 'Gen Z & student friend groups finishing burgers/rolls step out onto the sidewalk to extend their outing with dessert.' :
                     selectedComplementarySpectrum === 'Late-Night Pubs & Breweries' 
                      ? 'Post-alcohol glucose dip drives intense late-night sweet tooth cravings between 10:00 PM and 1:30 AM.' :
                     selectedComplementarySpectrum === 'Evening Tiffin & Heritage Cafes' 
                      ? 'Warm crispy ghee butter dosas & filter coffee followed by multi-generational family evening dessert stroll.' :
                     'High-impact transit terminals, shopping malls, cultural auditoriums, pedestrian walkways, and dining anchors driving peak dessert sales.'}
                  </p>
                </div>

                {/* 3. Specific Brand / Venue Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    {selectedComplementarySpectrum === 'ALL'
                      ? `Select Complementary Venue (${correspondingComplementaryVenues.length}):`
                      : `${selectedComplementarySpectrum} (${correspondingComplementaryVenues.length}):`}
                  </label>
                  <select
                    value={selectedComplementaryBrand?.properties?.id || ''}
                    onChange={(e) => {
                      const match = complementaryBrandsData?.features?.find(f => f.properties?.id === e.target.value);
                      if (match && onSelectComplementaryBrand) {
                        onSelectComplementaryBrand(match);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">
                      {selectedComplementarySpectrum === 'ALL' 
                        ? 'Select metro, mall, cinema, hotspot or dining landmark...' 
                        : `Select ${selectedComplementarySpectrum}...`}
                    </option>
                    {correspondingComplementaryVenues.map(f => (
                      <option key={f.properties?.id} value={f.properties?.id}>
                        {f.properties?.name} — {f.properties?.locality} (Synergy: {f.properties?.synergy_score}/100)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Selected Complementary Venue Snapshot Card */}
                {selectedComplementaryBrand && (
                  <div className="bg-orange-100/90 border border-orange-300 rounded-lg p-2 text-[10px] text-orange-950 space-y-1">
                    <div className="font-extrabold flex items-center justify-between">
                      <span className="truncate">{selectedComplementaryBrand.properties?.name}</span>
                      <span className="text-emerald-700 shrink-0 font-bold ml-1 bg-emerald-100 px-1 rounded border border-emerald-300">
                        Synergy: {selectedComplementaryBrand.properties?.synergy_score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-semibold">
                      <span className="px-1 py-0.2 rounded bg-orange-200 text-orange-900 font-bold">
                        {selectedComplementaryBrand.properties?.spectrum_category}
                      </span>
                      <span className="truncate">{selectedComplementaryBrand.properties?.locality}</span>
                    </div>
                    <div className="text-slate-600 line-clamp-1">{selectedComplementaryBrand.properties?.address}</div>
                    <div className="text-slate-800 font-bold flex justify-between pt-0.5 border-t border-orange-200">
                      <span>Peak Spillover:</span>
                      <span className="text-orange-900 font-extrabold">{selectedComplementaryBrand.properties?.peak_window}</span>
                    </div>
                    <div className="text-[9px] text-slate-700 flex justify-between">
                      <span>Est. Daily Traffic:</span>
                      <span>~{selectedComplementaryBrand.properties?.daily_customer_footfall?.toLocaleString()} diners/day</span>
                    </div>
                    <div className="text-[9px] text-emerald-800 font-medium italic border-t border-orange-200/60 pt-0.5">
                      {selectedComplementaryBrand.properties?.synergy_reason}
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

          {/* Layer 8: Demographics Information */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.hexDemographics 
                ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div 
              onClick={() => toggleLayer('hexDemographics')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.hexDemographics 
                  ? 'bg-emerald-600 border-emerald-700 text-white' 
                  : 'bg-white border-slate-300'
              }`}>
                {activeLayers.hexDemographics && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-slate-900">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    Demographics Information
                  </span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/70 border border-emerald-600" />
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Census population, age & gender distribution
                </p>
              </div>
            </div>

            {/* In-Panel Controls: Gender Toggle & Age Determination Filter */}
            {activeLayers.hexDemographics && (
              <div 
                className="mt-2.5 pt-2 border-t border-emerald-200/80 space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Gender Segment Toggle */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-700 font-semibold mb-1">
                    <span>Gender Segment:</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {demographicGender === 'male' ? '4.42M (50.7%)' : demographicGender === 'female' ? '4.29M (49.3%)' : '8.70M Total'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded border border-slate-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('all')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'all'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All Pop
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('male')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'male'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('female')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'female'
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* 2. Age Determination Filter */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-700 font-semibold mb-1">
                    <span>Age Determination:</span>
                    {demographicAge === 'kids' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold border border-amber-300">
                        Primary Target
                      </span>
                    )}
                  </div>
                  <select
                    value={demographicAge}
                    onChange={(e) => setDemographicAge && setDemographicAge(e.target.value)}
                    className="w-full text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Ages (0–90+ yrs) • 8.70M</option>
                    <option value="kids">Kids & Children (0–14 yrs) • 1.72M [Ice Cream Target]</option>
                    <option value="youth">Youth & Students (15–24 yrs) • 1.51M</option>
                    <option value="adults">Working Adults (25–54 yrs) • 3.99M</option>
                    <option value="seniors">Mature & Seniors (55+ yrs) • 1.48M</option>
                  </select>
                </div>

                {/* 3. Active Metric Summary */}
                <div className="bg-white/90 rounded p-1.5 border border-emerald-200 text-[10px] flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Selected Cohort:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {(() => {
                      const labels = {
                        all: { all: '8.70M Residents', male: '4.42M Males', female: '4.29M Females' },
                        kids: { all: '1.72M Kids (0–14)', male: '881k Male Kids', female: '840k Female Kids' },
                        youth: { all: '1.51M Youth (15–24)', male: '782k Male Youth', female: '723k Female Youth' },
                        adults: { all: '3.99M Adults (25–54)', male: '2.05M Male Adults', female: '1.94M Female Adults' },
                        seniors: { all: '1.48M Seniors (55+)', male: '708k Male Seniors', female: '776k Female Seniors' }
                      };
                      return labels[demographicAge]?.[demographicGender] || '8.70M Total';
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Layer 9: Schools, Colleges & Coaching Institutes (Independent Widget) */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.educationPois 
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {/* Clickable Header to Toggle Layer */}
            <div 
              onClick={() => toggleLayer('educationPois')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.educationPois 
                  ? 'bg-amber-600 border-amber-700 text-white' 
                  : 'bg-white border-slate-300'
              }`}>
                {activeLayers.educationPois && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-slate-900">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    Schools, Colleges & Coaching ({totalEducationCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" title="Schools" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" title="Colleges" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white" title="Coaching" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Schools, colleges, tuition hubs & student footfall
                </p>
              </div>
            </div>

            {/* When Layer is enabled, show Category and Institution dropdowns */}
            {activeLayers.educationPois && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-amber-200/80 space-y-2 text-xs"
              >
                {/* 1. Category Filter Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 mb-1">
                    <span>Institution Category:</span>
                    {selectedEducationCategory !== 'ALL' && (
                      <button
                        onClick={() => setSelectedEducationCategory && setSelectedEducationCategory('ALL')}
                        className="text-[9px] text-amber-700 hover:text-amber-900 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalEducationCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedEducationCategory}
                    onChange={(e) => setSelectedEducationCategory && setSelectedEducationCategory(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2 py-1.5 text-xs font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Educational Institutions ({totalEducationCount})</option>
                    {educationCategories.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name === 'School' ? 'Schools & Academies' :
                         c.name === 'College' ? 'Colleges & Universities' :
                         c.name === 'Coaching Institute' ? 'Coaching & Test Prep Hubs' :
                         c.name === 'Activity & Sports' ? 'Kids Activity & Sports Arenas' : c.name} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Specific Institution Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    {selectedEducationCategory === 'ALL'
                      ? `Select Institution (${correspondingEducationPois.length}):`
                      : `${selectedEducationCategory} (${correspondingEducationPois.length}):`}
                  </label>
                  <select
                    value={selectedEducationPoi?.properties?.id || ''}
                    onChange={(e) => {
                      const match = educationPoisData?.features?.find(f => f.properties?.id === e.target.value);
                      if (match && onSelectEducationPoi) {
                        onSelectEducationPoi(match);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">
                      {selectedEducationCategory === 'ALL' 
                        ? 'Select school, college, coaching hub...' 
                        : `Select ${selectedEducationCategory}...`}
                    </option>
                    {correspondingEducationPois.map(f => (
                      <option key={f.properties?.id} value={f.properties?.id}>
                        {f.properties?.name} — {f.properties?.locality} ({f.properties?.student_capacity?.toLocaleString()} students)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Selected Institution Detail Snapshot */}
                {selectedEducationPoi && (
                  <div className="bg-amber-100/90 border border-amber-300 rounded-lg p-2 text-[10px] text-amber-950 space-y-1">
                    <div className="font-extrabold flex items-center justify-between">
                      <span className="truncate">{selectedEducationPoi.properties?.name}</span>
                      <span className="text-emerald-700 shrink-0 font-bold ml-1 bg-emerald-100 px-1 rounded border border-emerald-300">
                        Synergy: {selectedEducationPoi.properties?.synergy_score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-semibold">
                      <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                        {selectedEducationPoi.properties?.category}
                      </span>
                      <span className="truncate">{selectedEducationPoi.properties?.locality}</span>
                    </div>
                    <div className="text-slate-600 line-clamp-1">{selectedEducationPoi.properties?.address}</div>
                    <div className="text-slate-800 font-bold flex justify-between pt-0.5 border-t border-amber-200">
                      <span>Capacity & Target:</span>
                      <span>~{selectedEducationPoi.properties?.student_capacity?.toLocaleString()} ({selectedEducationPoi.properties?.target_age_group})</span>
                    </div>
                    <div className="text-[9px] text-amber-900 font-medium">
                      <span className="font-bold">Peak Window:</span> {selectedEducationPoi.properties?.peak_window}
                    </div>
                    <div className="text-[9px] text-emerald-800 font-medium italic border-t border-amber-200/60 pt-0.5">
                      {selectedEducationPoi.properties?.dessert_synergy_reason}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
