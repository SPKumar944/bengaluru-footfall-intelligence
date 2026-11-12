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
import { 
  getSpectrumIcon,
  getEducationIcon,
  getKidsIcon,
  IceCreamIcon,
  SundaeIcon,
  StoreIcon,
  GiftIcon,
  GamepadIcon,
  TicketIcon,
  TreesIcon,
  SchoolIcon,
  UniversityIcon,
  BookOpenIcon,
  TrophyIcon,
  MetroIcon, 
  ShoppingMallsIcon, 
  CinemasIcon, 
  WalkwaysIcon, 
  HotSpicyIcon,
  YouthFastCasualIcon,
  LateNightPubsIcon,
  EveningTiffinIcon,
  BuildingIcon,
  HomeIcon,
  FactoryIcon,
  ScaleIcon,
  ZapIcon,
  LayersIcon,
  MapPinIcon,
  GlobeIcon
} from './IconMCP';
import FootfallRangeSelector from './FootfallRangeSelector';
import { 
  formatMonthlyCupVolumeRange, 
  formatVenueTrafficRange, 
  formatKidsMonthlyTrafficRange 
} from '../utils/footfallFormatters';

export default function LayerControlWidget({
  activeLayers,
  setActiveLayers,
  h3HubsData,
  selectedHubTypeFilter = 'ALL',
  setSelectedHubTypeFilter,
  selectedHubMetricView = 'pockets',
  setSelectedHubMetricView,
  scopeHubsToRadius = true,
  setScopeHubsToRadius,
  selectedHexagon,
  setSelectedHexagon,
  commercialResidentialHubsData,
  selectedHub,
  onSelectHub,
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
  setDemographicAge,
  selectedFootfallRange = 'ALL',
  setSelectedFootfallRange,
  scopeToRadiusCircle = true,
  setScopeToRadiusCircle,
  streetFootfallData,
  selectedApsaraStore,
  activeHour = 21,
  activeDay = 'saturday',
  activeDayType = 'weekend'
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

  // Extract H3 Commercial & Residential Land Use Hexagons counts
  const totalH3HexCount = h3HubsData?.metadata?.total_hexagons || h3HubsData?.hexagons?.length || 15514;
  const h3Counts = h3HubsData?.metadata?.counts || {
    commercial: 775,
    residential: 13828,
    industrial: 560,
    mixed: 351
  };

  // Extract commercial vs residential hubs and counts (legacy fallback)
  const totalHubsCount = commercialResidentialHubsData?.features?.length || 51;
  const commercialCount = React.useMemo(() => {
    if (!commercialResidentialHubsData?.features) return 22;
    return commercialResidentialHubsData.features.filter(f => f.properties?.hub_type === 'commercial').length;
  }, [commercialResidentialHubsData]);

  const residentialCount = React.useMemo(() => {
    if (!commercialResidentialHubsData?.features) return 29;
    return commercialResidentialHubsData.features.filter(f => f.properties?.hub_type === 'residential').length;
  }, [commercialResidentialHubsData]);

  // Hubs corresponding to selected pocket classification filter
  const correspondingHubs = React.useMemo(() => {
    if (!commercialResidentialHubsData?.features) return [];
    const list = selectedHubTypeFilter === 'ALL'
      ? commercialResidentialHubsData.features
      : commercialResidentialHubsData.features.filter(f => f.properties?.hub_type === selectedHubTypeFilter);
    return [...list].sort((a, b) => (a.properties?.name || '').localeCompare(b.properties?.name || ''));
  }, [commercialResidentialHubsData, selectedHubTypeFilter]);

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="observatory-card rounded-xl p-2.5 text-xs font-mono border border-ink-950/[0.1] bg-white/95 backdrop-blur-md w-72 sm:w-80 shadow-[0_1px_2px_rgba(13,21,33,0.04),0_10px_28px_-20px_rgba(13,21,33,0.18)] transition-all select-none max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header / Collapse Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-1.5 border-b border-ink-950/[0.08]"
      >
        <div className="flex items-center gap-2">
          <img src="./brand/icon.png" alt="AGT" className="w-4 h-4 object-contain rounded shrink-0" />
          <span className="font-bold text-ink-950 text-xs tracking-tight">AGT DATA LAYERS</span>
          <span className="text-[10px] bg-azure-500/[0.08] text-azure-700 font-bold px-2 py-0.5 rounded-full border border-azure-500/30">
            {activeCount} Active
          </span>
        </div>
        <button className="text-ink-400 hover:text-ink-950 transition-colors p-0.5">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Layer Checkboxes & Controls */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Layer 1: Street Footfall Network with Embedded 11-Color Range Selector */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.streetFootfall 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div 
              onClick={() => toggleLayer('streetFootfall')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.streetFootfall 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.streetFootfall && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <Footprints className="w-3.5 h-3.5 text-azure-600" />
                    Street Footfall Flow
                  </span>
                  <span className="w-8 h-1.5 rounded-full bg-gradient-to-r from-[#001f4d] via-[#29b6f6] to-[#7b0000]" />
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  47k real roads • 11-step index (1 to 10+)
                </p>
              </div>
            </div>

            {/* Embedded Footfall Range Filter & Radius Circle Controls */}
            {activeLayers.streetFootfall && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2 pt-2 border-t border-ink-950/[0.08]"
              >
                <FootfallRangeSelector
                  selectedFootfallRange={selectedFootfallRange}
                  onSelectFootfallRange={setSelectedFootfallRange}
                  scopeToRadiusCircle={scopeToRadiusCircle}
                  onToggleScopeToRadiusCircle={setScopeToRadiusCircle}
                  streetFootfallData={streetFootfallData}
                  selectedApsaraStore={selectedApsaraStore}
                  activeHour={activeHour}
                  activeDay={activeDay}
                  activeDayType={activeDayType}
                />
              </div>
            )}
          </div>

          {/* Layer 2: Apsara Store 350m Catchments */}
          <div 
            onClick={() => toggleLayer('catchments')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.catchments 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.catchments 
                ? 'bg-ink-950 border-ink-950 text-white' 
                : 'bg-white border-ink-950/[0.2]'
            }`}>
              {activeLayers.catchments && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                  <CircleDot className="w-3.5 h-3.5 text-amber-600" />
                  350m Store Catchment Perimeter
                </span>
                <span className="w-2.5 h-2.5 rounded-full border border-amber-600 bg-amber-500/30" />
              </div>
              <p className="text-[9px] text-ink-500 mt-0.5">
                350m pedestrian buffer around Apsara stores
              </p>
            </div>
          </div>

          {/* Layer 3: Apsara Stores */}
          <div 
            onClick={() => toggleLayer('apsaraStores')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.apsaraStores 
                ? 'bg-azure-50/70 border-azure-300 text-ink-950 shadow-2xs' 
                : 'bg-paper-50/80 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.apsaraStores 
                ? 'bg-ink-950 border-ink-950 text-white' 
                : 'bg-white border-ink-950/[0.2]'
            }`}>
              {activeLayers.apsaraStores && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                  <IceCreamIcon size={14} className="text-ink-950" />
                  Apsara Outlets (13)
                </span>
                <span className="w-4 h-4 rounded-full border border-ink-950 bg-white flex items-center justify-center shadow-2xs">
                  <IceCreamIcon size={9} className="text-ink-950" />
                </span>
              </div>
              <p className="text-[9px] text-ink-500 mt-0.5">
                Apsara Ice Cream client anchors
              </p>
            </div>
          </div>

          {/* Layer: Commercial & Residential Land Use Hexagons (H3 Res 9) */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.commercialResidentialHubs 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            {/* Clickable Header to Toggle Layer */}
            <div 
              onClick={() => toggleLayer('commercialResidentialHubs')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.commercialResidentialHubs 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.commercialResidentialHubs && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <Hexagon className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                    Land Use Hexagons ({totalH3HexCount.toLocaleString()})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-600/40 flex items-center justify-center text-amber-800 shadow-2xs" title="Commercial Hubs">
                      <BuildingIcon size={10} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-600/40 flex items-center justify-center text-indigo-800 shadow-2xs" title="Residential Pockets">
                      <HomeIcon size={10} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-purple-500/10 border border-purple-600/40 flex items-center justify-center text-purple-800 shadow-2xs" title="Industrial & Tech Corridors">
                      <FactoryIcon size={10} />
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  H3 Res 9 (~210m diam) • Residential, Commercial & Synergy indices
                </p>
              </div>
            </div>

            {/* When Layer is enabled, show Radius Scope, Pocket Type filter, Metric Mode & Selected Hexagon */}
            {activeLayers.commercialResidentialHubs && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2 text-xs"
              >
                {/* 1. Radius Scope Switch (3.5km Store Catchment vs Full City) */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-ink-700 font-semibold mb-1">
                    <span>Spatial Boundary:</span>
                    <span className="text-[9px] text-azure-700 font-mono font-bold">
                      {scopeHubsToRadius ? `3.5km Catchment (${selectedApsaraStore?.locality || 'Store'})` : `Full Bengaluru Metro (${totalH3HexCount.toLocaleString()})`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-paper-100 p-0.5 rounded border border-ink-950/[0.08] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setScopeHubsToRadius && setScopeHubsToRadius(true)}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        scopeHubsToRadius
                          ? 'bg-azure-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                    >
                      <MapPinIcon size={11} />
                      <span>3.5km Catchment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeHubsToRadius && setScopeHubsToRadius(false)}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        !scopeHubsToRadius
                          ? 'bg-ink-950 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                    >
                      <GlobeIcon size={11} />
                      <span>Full City ({totalH3HexCount.toLocaleString()})</span>
                    </button>
                  </div>
                </div>

                {/* 2. Land Use Pocket Classification Filter */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-ink-700 font-semibold mb-1">
                    <span>Pocket Classification:</span>
                    <span className="text-[9px] text-ink-500 font-mono">
                      {selectedHubTypeFilter === 'commercial' ? `${h3Counts.commercial} Comm` : 
                       selectedHubTypeFilter === 'residential' ? `${h3Counts.residential.toLocaleString()} Resid` : 
                       selectedHubTypeFilter === 'industrial' ? `${h3Counts.industrial} Tech` : 
                       selectedHubTypeFilter === 'mixed' ? `${h3Counts.mixed} Mixed` : 'All 15.5k'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-0.5 bg-paper-100 p-0.5 rounded border border-ink-950/[0.08] text-[9.5px]">
                    <button
                      type="button"
                      onClick={() => setSelectedHubTypeFilter && setSelectedHubTypeFilter('ALL')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        selectedHubTypeFilter === 'ALL'
                          ? 'bg-ink-950 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title="All Land Use Types"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubTypeFilter && setSelectedHubTypeFilter('commercial')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubTypeFilter === 'commercial'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title={`Commercial Hubs (${h3Counts.commercial})`}
                    >
                      <BuildingIcon size={10} />
                      <span>Comm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubTypeFilter && setSelectedHubTypeFilter('residential')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubTypeFilter === 'residential'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title={`Residential Pockets (${h3Counts.residential.toLocaleString()})`}
                    >
                      <HomeIcon size={10} />
                      <span>Resid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubTypeFilter && setSelectedHubTypeFilter('industrial')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubTypeFilter === 'industrial'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title={`Tech & Industrial Corridors (${h3Counts.industrial})`}
                    >
                      <FactoryIcon size={10} />
                      <span>Tech</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubTypeFilter && setSelectedHubTypeFilter('mixed')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubTypeFilter === 'mixed'
                          ? 'bg-cyan-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title={`Mixed-Use High-Streets (${h3Counts.mixed})`}
                    >
                      <ScaleIcon size={10} />
                      <span>Mixed</span>
                    </button>
                  </div>
                </div>

                {/* 3. Metric Visualization View Mode Selector */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-ink-700 font-semibold mb-1">
                    <span>Hexagon Metric View Mode:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-paper-100 p-0.5 rounded border border-ink-950/[0.08] text-[9.5px]">
                    <button
                      type="button"
                      onClick={() => setSelectedHubMetricView && setSelectedHubMetricView('pockets')}
                      className={`py-1 px-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubMetricView === 'pockets'
                          ? 'bg-ink-950 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title="Color by Land Use Classification (Comm, Resid, Tech, Mixed)"
                    >
                      <LayersIcon size={11} />
                      <span>Land Use Types</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubMetricView && setSelectedHubMetricView('residential')}
                      className={`py-1 px-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubMetricView === 'residential'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title="Color by Residential Index (Population, Built-up m², Volume m³)"
                    >
                      <HomeIcon size={11} />
                      <span>Residential Idx</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubMetricView && setSelectedHubMetricView('commercial')}
                      className={`py-1 px-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubMetricView === 'commercial'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title="Color by Commercial Index (Daytime Workforce, Office Floor Area)"
                    >
                      <BuildingIcon size={11} />
                      <span>Commercial Idx</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHubMetricView && setSelectedHubMetricView('synergy')}
                      className={`py-1 px-1 rounded font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedHubMetricView === 'synergy'
                          ? 'bg-azure-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                      title="Color by Retail Footfall Synergy Score (0–100)"
                    >
                      <ZapIcon size={11} />
                      <span>Synergy Score</span>
                    </button>
                  </div>
                </div>

                {/* 4. Selected Hexagon Inspection Snapshot */}
                {selectedHexagon ? (
                  <div className="bg-paper-50 border border-ink-950/[0.1] rounded-lg p-2 text-[10px] text-ink-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`p-1 rounded bg-white border text-[11px] shrink-0 flex items-center justify-center ${
                          selectedHexagon.cls === 'commercial' ? 'border-amber-500/40 text-amber-700' :
                          selectedHexagon.cls === 'residential' ? 'border-indigo-500/40 text-indigo-700' :
                          selectedHexagon.cls === 'industrial' ? 'border-purple-500/40 text-purple-700' :
                          'border-cyan-500/40 text-cyan-700'
                        }`}>
                          {selectedHexagon.cls === 'commercial' ? <BuildingIcon size={13} /> :
                           selectedHexagon.cls === 'residential' ? <HomeIcon size={13} /> :
                           selectedHexagon.cls === 'industrial' ? <FactoryIcon size={13} /> : <ScaleIcon size={13} />}
                        </span>
                        <span className="truncate">{selectedHexagon.ward || 'Bengaluru'}</span>
                      </div>
                      <button
                        onClick={() => setSelectedHexagon && setSelectedHexagon(null)}
                        className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-ink-500 font-mono">
                      <span>H3: {selectedHexagon.h.slice(0, 10)}...</span>
                      <span className="text-azure-700 font-bold bg-white px-1.5 py-0.5 rounded border border-ink-950/[0.08] flex items-center gap-1">
                        <ZapIcon size={10} className="text-azure-700" />
                        <span>Synergy: {selectedHexagon.syn_idx}/100</span>
                      </span>
                    </div>

                    {/* Mini Index Progress Bars */}
                    <div className="space-y-1.5 pt-1.5 border-t border-ink-950/[0.06]">
                      <div>
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span className="text-indigo-800 font-semibold flex items-center gap-1">
                            <HomeIcon size={10} className="text-indigo-800" />
                            <span>Residential Index:</span>
                          </span>
                          <span className="font-mono font-bold text-indigo-900">{selectedHexagon.res_idx}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, selectedHexagon.res_idx))}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span className="text-amber-800 font-semibold flex items-center gap-1">
                            <BuildingIcon size={10} className="text-amber-800" />
                            <span>Commercial Index:</span>
                          </span>
                          <span className="font-mono font-bold text-amber-900">{selectedHexagon.com_idx}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, selectedHexagon.com_idx))}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span className="text-azure-800 font-semibold flex items-center gap-1">
                            <ZapIcon size={10} className="text-azure-800" />
                            <span>Retail Synergy:</span>
                          </span>
                          <span className="font-mono font-bold text-azure-900">{selectedHexagon.syn_idx}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-azure-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, selectedHexagon.syn_idx))}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Numerical Data Grid */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-ink-950/[0.06] text-[9.5px]">
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Resident Pop:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.res_pop.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Daytime Workforce:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.com_workers ? selectedHexagon.com_workers.toLocaleString() : '0'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Kids / Youth:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.kids} kids • {selectedHexagon.youth} youth</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Office Built-up:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.off_m2 ? `${Math.round(selectedHexagon.off_m2).toLocaleString()} m²` : '0 m²'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Residential Space:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.res_built_m2 ? `${Math.round(selectedHexagon.res_built_m2).toLocaleString()} m²` : '0 m²'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <span className="text-ink-500 block text-[8px] uppercase tracking-wider font-semibold">Office Buildings:</span>
                        <span className="font-bold text-ink-950 font-mono text-[10px]">{selectedHexagon.off_cnt ? `${selectedHexagon.off_cnt} buildings` : '0 buildings'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-paper-100/70 border border-ink-950/[0.06] rounded-lg p-2 text-[9.5px] text-ink-500 leading-snug text-center">
                    Click any hexagon on the map to inspect its exact residential, commercial, office built-up and synergy metrics.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Layer 4: Competitor Parlors with In-Panel Brand & Store Selector */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.competitors 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            {/* Clickable Header to Toggle Competitor Layer */}
            <div 
              onClick={() => toggleLayer('competitors')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.competitors 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.competitors && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <SundaeIcon size={14} className="text-ink-950" />
                    Competitor Parlors (108)
                  </span>
                  <span className="w-4 h-4 rounded-full border border-ink-950 bg-white flex items-center justify-center shadow-2xs" title="Competitor Parlor">
                    <SundaeIcon size={9} className="text-ink-950" />
                  </span>
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  Corner House, Naturals, Polar Bear, Milano...
                </p>
              </div>
            </div>

            {/* When Competitor Layer is enabled, show the Brand and Store dropdowns right here */}
            {activeLayers.competitors && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2 text-xs"
              >
                {/* 1. Brand Filter Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink-950 mb-1">
                    <span>Brand Filter:</span>
                    {selectedBrandFilter !== 'ALL' && (
                      <button
                        onClick={() => setSelectedBrandFilter && setSelectedBrandFilter('ALL')}
                        className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal cursor-pointer"
                      >
                        Reset All (108)
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter && setSelectedBrandFilter(e.target.value)}
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <label className="block text-[10px] font-bold text-ink-700 mb-1">
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
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <div className="bg-paper-50 border border-ink-950/[0.1] rounded-lg p-2 text-[10px] text-ink-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="p-1 rounded bg-white border border-ink-950/[0.1] text-ink-950 shrink-0">
                          <SundaeIcon size={12} className="shrink-0" />
                        </span>
                        <span className="truncate">{selectedCompetitor.properties?.store_name}</span>
                      </div>
                      <span className="text-azure-700 shrink-0 font-bold bg-white px-1.5 py-0.5 rounded border border-ink-950/[0.1] text-[9px] font-mono">
                        ★ {selectedCompetitor.properties?.rating_proxy}
                      </span>
                    </div>
                    <div className="text-ink-500 line-clamp-1">{selectedCompetitor.properties?.address}</div>
                    <div className="text-ink-800 font-semibold flex justify-between pt-1 border-t border-ink-950/[0.08]">
                      <span>Monthly Volume:</span>
                      <span className="font-bold font-mono">{formatMonthlyCupVolumeRange(selectedCompetitor.properties?.monthly_cup_volume_est)}</span>
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
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            {/* Clickable Header to Toggle Complementary Brands */}
            <div 
              onClick={() => toggleLayer('complementaryBrands')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.complementaryBrands 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.complementaryBrands && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <StoreIcon size={14} className="text-ink-950" />
                    Complementary Brands ({totalComplementaryCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Metro & Transit">
                      <MetroIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Shopping Malls">
                      <ShoppingMallsIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Cinemas & Auditoriums">
                      <CinemasIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Street Walkways">
                      <WalkwaysIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Spicy Biryani">
                      <HotSpicyIcon size={9} />
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  Metro, Malls, Cinemas, Walkways, Biryani, Burgers & Pubs
                </p>
              </div>
            </div>

            {/* When Layer is enabled, show the Synergy Spectrum and Venue Selector */}
            {activeLayers.complementaryBrands && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2 text-xs"
              >
                {/* 1. Synergy Spectrum Pillar Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink-950 mb-1">
                    <span>Category / Hotspot Type:</span>
                    {selectedComplementarySpectrum !== 'ALL' && (
                      <button
                        onClick={() => setSelectedComplementarySpectrum && setSelectedComplementarySpectrum('ALL')}
                        className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalComplementaryCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedComplementarySpectrum}
                    onChange={(e) => setSelectedComplementarySpectrum && setSelectedComplementarySpectrum(e.target.value)}
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Categories & Hotspots ({totalComplementaryCount} Venues)</option>
                    <option value="Metro Stations & Transit Terminals">Metro & Transit Terminals ({complementarySpectrums.find(s => s[0] === 'Metro Stations & Transit Terminals')?.[1] || 47})</option>
                    <option value="Shopping Malls & Retail Hubs">Shopping Malls & Retail Hubs ({complementarySpectrums.find(s => s[0] === 'Shopping Malls & Retail Hubs')?.[1] || 18})</option>
                    <option value="Cinemas & Cultural Auditoriums">Cinemas & Cultural Auditoriums ({complementarySpectrums.find(s => s[0] === 'Cinemas & Cultural Auditoriums')?.[1] || 11})</option>
                    <option value="Street Walkways & Buzzing Hotspots">Street Walkways & Hotspots ({complementarySpectrums.find(s => s[0] === 'Street Walkways & Buzzing Hotspots')?.[1] || 14})</option>
                    <option value="Hot & Spicy Meals">Hot & Spicy Meals (Biryani) ({complementarySpectrums.find(s => s[0] === 'Hot & Spicy Meals')?.[1] || 21})</option>
                    <option value="Youth Fast Casual">Youth Fast Casual (Burgers & Pizza) ({complementarySpectrums.find(s => s[0] === 'Youth Fast Casual')?.[1] || 80})</option>
                    <option value="Late-Night Pubs & Breweries">Late-Night Pubs & Breweries ({complementarySpectrums.find(s => s[0] === 'Late-Night Pubs & Breweries')?.[1] || 17})</option>
                    <option value="Evening Tiffin & Heritage Cafes">Evening Tiffin & Heritage Cafes ({complementarySpectrums.find(s => s[0] === 'Evening Tiffin & Heritage Cafes')?.[1] || 53})</option>
                  </select>
                </div>

                {/* 2. Visual Spectrum Pillar Explanation Badge */}
                <div className="p-1.5 rounded bg-white border border-ink-950/[0.1] text-[10px] space-y-0.5 shadow-2xs">
                  <div className="font-extrabold text-ink-950 flex items-center gap-1.5">
                    <span className="shrink-0 text-ink-900">
                      {getSpectrumIcon(selectedComplementarySpectrum, { size: 14 })}
                    </span>
                    <span>
                      {selectedComplementarySpectrum === 'Metro Stations & Transit Terminals' ? 'Commuter Transit & Quick-Grab Impulse' :
                       selectedComplementarySpectrum === 'Shopping Malls & Retail Hubs' ? 'All-Weather Family Leisure & Retail Footfall' :
                       selectedComplementarySpectrum === 'Cinemas & Cultural Auditoriums' ? 'Pre/Post Show Crowd Spillover & Theatre Strolls' :
                       selectedComplementarySpectrum === 'Street Walkways & Buzzing Hotspots' ? 'High-Density Pedestrian Strolls & Leisure Strolls' :
                       selectedComplementarySpectrum === 'Hot & Spicy Meals' ? 'Capsaicin Relief & Milk Fat Need' :
                       selectedComplementarySpectrum === 'Youth Fast Casual' ? 'Extended Hangout & Student Cohort' :
                       selectedComplementarySpectrum === 'Late-Night Pubs & Breweries' ? 'Post-Alcohol Sweet Tooth & Midnight Craving' :
                       selectedComplementarySpectrum === 'Evening Tiffin & Heritage Cafes' ? 'Family Weekend Tradition & Evening Walkers' :
                       'High Dessert Synergy Landscape (8 Core Hub Pillars)'}
                    </span>
                  </div>
                  <p className="text-[9px] text-ink-600 leading-tight">
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
                  <label className="block text-[10px] font-bold text-ink-700 mb-1">
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
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <div className="bg-slate-100/90 border border-slate-300 rounded-lg p-2 text-[10px] text-slate-900 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="p-1 rounded bg-white border border-slate-300 text-slate-900 shrink-0">
                          {getSpectrumIcon(selectedComplementaryBrand.properties?.spectrum_category, { size: 12, className: 'shrink-0' })}
                        </span>
                        <span className="truncate">{selectedComplementaryBrand.properties?.name}</span>
                      </div>
                      <span className="text-slate-800 shrink-0 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[9px]">
                        Synergy: {selectedComplementaryBrand.properties?.synergy_score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-semibold">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold flex items-center gap-1">
                        {getSpectrumIcon(selectedComplementaryBrand.properties?.spectrum_category, { size: 11, className: 'shrink-0' })}
                        <span>{selectedComplementaryBrand.properties?.spectrum_category}</span>
                      </span>
                      <span className="truncate">{selectedComplementaryBrand.properties?.locality}</span>
                    </div>
                    <div className="text-slate-500 line-clamp-1">{selectedComplementaryBrand.properties?.address}</div>
                    <div className="text-slate-800 font-semibold flex justify-between pt-1 border-t border-slate-200">
                      <span>Peak Spillover:</span>
                      <span className="font-bold">{selectedComplementaryBrand.properties?.peak_window}</span>
                    </div>
                    <div className="text-[9px] text-slate-600 flex justify-between">
                      <span>Est. Daily Traffic:</span>
                      <span className="font-bold">{formatVenueTrafficRange(selectedComplementaryBrand.properties?.daily_customer_footfall, selectedComplementaryBrand.properties?.spectrum_category)}</span>
                    </div>
                    <div className="text-[9px] text-slate-700 font-medium italic border-t border-slate-200 pt-1">
                      {selectedComplementaryBrand.properties?.synergy_reason}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section Divider: Market Influencers */}
          <div className="pt-2 pb-0.5 border-t border-slate-200">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider font-mono">
              Market Influencers & Family Drivers
            </span>
          </div>

          {/* Layer 5: Kids & Family Footfall Magnets with Embedded Category & Location Filter */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.kidsAttractions 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            {/* Clickable Header to Toggle Kids Layer */}
            <div 
              onClick={() => toggleLayer('kidsAttractions')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.kidsAttractions 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.kidsAttractions && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <GamepadIcon size={14} className="text-ink-950" />
                    Kids & Family Magnets ({totalKidsCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Hamleys & Toys">
                      <GiftIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Arcades & Play">
                      <GamepadIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Theatres">
                      <TicketIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Parks & Lakes">
                      <TreesIcon size={9} />
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  Hamleys, Arcades, Theatres, Parks & Zoos
                </p>
              </div>
            </div>

            {/* When Kids Layer is enabled, show Category tabs and Attraction dropdown right here */}
            {activeLayers.kidsAttractions && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2 text-xs"
              >
                {/* 1. Category Filter Tabs / Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink-950 mb-1">
                    <span>Category Filter:</span>
                    {selectedKidsCategory !== 'ALL' && (
                      <button
                        onClick={() => setSelectedKidsCategory && setSelectedKidsCategory('ALL')}
                        className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalKidsCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedKidsCategory}
                    onChange={(e) => setSelectedKidsCategory && setSelectedKidsCategory(e.target.value)}
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <label className="block text-[10px] font-bold text-ink-700 mb-1">
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
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <div className="bg-paper-50 border border-ink-950/[0.1] rounded-lg p-2 text-[10px] text-ink-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="p-1 rounded bg-white border border-ink-950/[0.1] text-ink-950 shrink-0">
                          {getKidsIcon(selectedKidsAttraction.properties?.category, { size: 12, className: 'shrink-0' })}
                        </span>
                        <span className="truncate">{selectedKidsAttraction.properties?.name}</span>
                      </div>
                      <span className="text-azure-700 shrink-0 font-bold bg-white px-1.5 py-0.5 rounded border border-ink-950/[0.1] text-[9px] font-mono">
                        Synergy: {selectedKidsAttraction.properties?.ice_cream_attraction_score}/100
                      </span>
                    </div>
                    <div className="text-ink-500 line-clamp-1">{selectedKidsAttraction.properties?.address}</div>
                    <div className="text-ink-800 font-semibold flex justify-between pt-1 border-t border-ink-950/[0.08]">
                      <span>Monthly Traffic:</span>
                      <span className="font-bold font-mono">{formatKidsMonthlyTrafficRange(selectedKidsAttraction.properties?.est_monthly_family_footfall)}</span>
                    </div>
                    <div className="text-[9px] text-ink-600 font-medium flex items-center justify-between">
                      <span>Category: {selectedKidsAttraction.properties?.category}</span>
                      <span>Peak: {selectedKidsAttraction.properties?.peak_window}</span>
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
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.techParks 
                ? 'bg-ink-950 border-ink-950 text-white' 
                : 'bg-white border-ink-950/[0.2]'
            }`}>
              {activeLayers.techParks && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                  <BuildingIcon size={14} className="text-ink-950" />
                  Tech Parks & IT Campuses (95)
                </span>
                <span className="w-4 h-4 rounded-full border border-ink-950 bg-white flex items-center justify-center shadow-2xs" title="Tech Park">
                  <BuildingIcon size={9} className="text-ink-950" />
                </span>
              </div>
              <p className="text-[9px] text-ink-500 mt-0.5">
                Corporate hubs & daytime dessert demand
              </p>
            </div>
          </div>

          {/* Layer 7: Commercial Office Footprints */}
          <div 
            onClick={() => toggleLayer('officeFootprints')}
            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
              activeLayers.officeFootprints 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
              activeLayers.officeFootprints 
                ? 'bg-ink-950 border-ink-950 text-white' 
                : 'bg-white border-ink-950/[0.2]'
            }`}>
              {activeLayers.officeFootprints && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                  <Building2 className="w-3 h-3 text-azure-600" />
                  Office Footprints (3.1k)
                </span>
                <span className="w-2.5 h-2.5 rounded-xs bg-ink-800 border border-ink-950" />
              </div>
              <p className="text-[9px] text-ink-500 mt-0.5">
                Commercial buildings & workplace density
              </p>
            </div>
          </div>

          {/* Layer 8: Demographics Information */}
          <div 
            className={`p-2 rounded-lg transition-all border ${
              activeLayers.hexDemographics 
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            <div 
              onClick={() => toggleLayer('hexDemographics')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.hexDemographics 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.hexDemographics && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <Users className="w-3.5 h-3.5 text-azure-600" />
                    Demographics Information
                  </span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-azure-500/70 border border-azure-600" />
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  Census population, age & gender distribution
                </p>
              </div>
            </div>

            {/* In-Panel Controls: Gender Toggle & Age Determination Filter */}
            {activeLayers.hexDemographics && (
              <div 
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Gender Segment Toggle */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-ink-700 font-semibold mb-1">
                    <span>Gender Segment:</span>
                    <span className="text-[9px] text-ink-500 font-mono">
                      {demographicGender === 'male' ? '4.42M (50.7%)' : demographicGender === 'female' ? '4.29M (49.3%)' : '8.70M Total'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-paper-100 p-0.5 rounded border border-ink-950/[0.08] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('all')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'all'
                          ? 'bg-ink-950 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                    >
                      All Pop
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('male')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'male'
                          ? 'bg-azure-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemographicGender && setDemographicGender('female')}
                      className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                        demographicGender === 'female'
                          ? 'bg-violet-600 text-white shadow-2xs'
                          : 'text-ink-600 hover:bg-white'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* 2. Age Determination Filter */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-ink-700 font-semibold mb-1">
                    <span>Age Determination:</span>
                    {demographicAge === 'kids' && (
                      <span className="text-[9px] bg-azure-500/[0.08] text-azure-700 px-1.5 py-0.2 rounded font-bold border border-azure-500/30">
                        Primary Target
                      </span>
                    )}
                  </div>
                  <select
                    value={demographicAge}
                    onChange={(e) => setDemographicAge && setDemographicAge(e.target.value)}
                    className="w-full text-[11px] font-semibold bg-white border border-ink-950/[0.12] rounded px-2 py-1 text-ink-900 focus:outline-hidden focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Ages (0–90+ yrs) • 8.70M</option>
                    <option value="kids">Kids & Children (0–14 yrs) • 1.72M [Ice Cream Target]</option>
                    <option value="youth">Youth & Students (15–24 yrs) • 1.51M</option>
                    <option value="adults">Working Adults (25–54 yrs) • 3.99M</option>
                    <option value="seniors">Mature & Seniors (55+ yrs) • 1.48M</option>
                  </select>
                </div>

                {/* 3. Active Metric Summary */}
                <div className="bg-white rounded p-1.5 border border-ink-950/[0.1] text-[10px] flex justify-between items-center shadow-2xs">
                  <span className="text-ink-500 font-medium">Selected Cohort:</span>
                  <span className="font-bold text-azure-700 font-mono">
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
                ? 'bg-paper-50 border-ink-950/[0.14] text-ink-950 shadow-2xs' 
                : 'bg-paper-50/70 border-ink-950/[0.08] text-ink-500 hover:bg-paper-100 hover:text-ink-800'
            }`}
          >
            {/* Clickable Header to Toggle Layer */}
            <div 
              onClick={() => toggleLayer('educationPois')}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                activeLayers.educationPois 
                  ? 'bg-ink-950 border-ink-950 text-white' 
                  : 'bg-white border-ink-950/[0.2]'
              }`}>
                {activeLayers.educationPois && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5 text-ink-950">
                    <UniversityIcon size={14} className="text-ink-950" />
                    Schools, Colleges & Coaching ({totalEducationCount})
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Schools">
                      <SchoolIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Colleges">
                      <UniversityIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Coaching">
                      <BookOpenIcon size={9} />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-white border border-ink-950 flex items-center justify-center text-ink-950 shadow-2xs" title="Sports">
                      <TrophyIcon size={9} />
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-ink-500 mt-0.5">
                  Schools, colleges, tuition hubs & student footfall
                </p>
              </div>
            </div>

            {/* When Layer is enabled, show Category and Institution dropdowns */}
            {activeLayers.educationPois && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 pt-2 border-t border-ink-950/[0.08] space-y-2 text-xs"
              >
                {/* 1. Category Filter Selector */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink-950 mb-1">
                    <span>Institution Category:</span>
                    {selectedEducationCategory !== 'ALL' && (
                      <button
                        onClick={() => setSelectedEducationCategory && setSelectedEducationCategory('ALL')}
                        className="text-[9px] text-azure-600 hover:text-azure-800 underline font-normal cursor-pointer"
                      >
                        Reset All ({totalEducationCount})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedEducationCategory}
                    onChange={(e) => setSelectedEducationCategory && setSelectedEducationCategory(e.target.value)}
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <label className="block text-[10px] font-bold text-ink-700 mb-1">
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
                    className="w-full bg-white border border-ink-950/[0.12] rounded px-2 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer shadow-2xs"
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
                  <div className="bg-paper-50 border border-ink-950/[0.1] rounded-lg p-2 text-[10px] text-ink-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="p-1 rounded bg-white border border-ink-950/[0.1] text-ink-950 shrink-0">
                          {getEducationIcon(selectedEducationPoi.properties?.category, { size: 12, className: 'shrink-0' })}
                        </span>
                        <span className="truncate">{selectedEducationPoi.properties?.name}</span>
                      </div>
                      <span className="text-azure-700 shrink-0 font-bold bg-white px-1.5 py-0.5 rounded border border-ink-950/[0.1] text-[9px] font-mono">
                        Synergy: {selectedEducationPoi.properties?.synergy_score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-ink-600 font-semibold">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-ink-950/[0.1] text-ink-900 font-bold flex items-center gap-1">
                        {getEducationIcon(selectedEducationPoi.properties?.category, { size: 11, className: 'shrink-0' })}
                        <span>{selectedEducationPoi.properties?.category}</span>
                      </span>
                      <span className="truncate">{selectedEducationPoi.properties?.locality}</span>
                    </div>
                    <div className="text-ink-500 line-clamp-1">{selectedEducationPoi.properties?.address}</div>
                    <div className="text-ink-800 font-semibold flex justify-between pt-1 border-t border-ink-950/[0.08]">
                      <span>Capacity & Target:</span>
                      <span className="font-bold font-mono">~{selectedEducationPoi.properties?.student_capacity?.toLocaleString()} ({selectedEducationPoi.properties?.target_age_group})</span>
                    </div>
                    <div className="text-[9px] text-ink-600 font-medium flex items-center justify-between">
                      <span className="font-bold">Peak Window:</span>
                      <span>{selectedEducationPoi.properties?.peak_window}</span>
                    </div>
                    <div className="text-[9px] text-ink-700 font-medium italic border-t border-ink-950/[0.08] pt-1">
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
