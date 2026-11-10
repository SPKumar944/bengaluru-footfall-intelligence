import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import BottomTransectBar from './components/BottomTransectBar';
import TopRightLegend from './components/TopRightLegend';
import MapViewport from './components/MapViewport';
import LayerControlWidget from './components/LayerControlWidget';
import ApsaraDossierModal from './components/ApsaraDossierModal';
import { Loader2 } from 'lucide-react';

const INDIRANAGAR_2D_VIEW = {
  longitude: 77.6386,
  latitude: 12.9822,
  zoom: 14.5,
  pitch: 0,
  bearing: 0
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datasets
  const [streetFootfallData, setStreetFootfallData] = useState(null);
  const [catchmentsData, setCatchmentsData] = useState(null);
  const [apsaraStoresData, setApsaraStoresData] = useState([]);
  const [competitorsData, setCompetitorsData] = useState(null);

  // New Ice Cream Market Influencer Datasets
  const [kidsAttractionsData, setKidsAttractionsData] = useState(null);
  const [techParksData, setTechParksData] = useState(null);
  const [officeFootprintsData, setOfficeFootprintsData] = useState(null);
  const [hexDemographicsData, setHexDemographicsData] = useState(null);
  const [educationPoisData, setEducationPoisData] = useState(null);
  const [complementaryBrandsData, setComplementaryBrandsData] = useState(null);
  const [demographicGender, setDemographicGender] = useState('all'); // 'all' | 'male' | 'female'
  const [demographicAge, setDemographicAge] = useState('all'); // 'all' | 'kids' | 'youth' | 'adults' | 'seniors'

  // Active Layers Toggle State (with real market influencer layers)
  const [activeLayers, setActiveLayers] = useState({
    streetFootfall: true,
    catchments: true,
    apsaraStores: true,
    competitors: false,
    kidsAttractions: true,      // 116 Kids & Family Footfall Magnets
    complementaryBrands: true,  // 171 Complementary Dining Brands (Biryani, Burgers, Breweries, Tiffins)
    educationPois: true,        // 102 Schools, Colleges & Coaching Institutes
    techParks: false,           // 95 Tech Parks & IT Campuses
    officeFootprints: false,    // 3,137 Commercial Office Buildings
    hexDemographics: false      // 19.5k H3 Hexagon Demographics & Density
  });

  // Selected Entities
  const [selectedApsaraStore, setSelectedApsaraStore] = useState(null);
  const [showApsaraModal, setShowApsaraModal] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [selectedKidsCategory, setSelectedKidsCategory] = useState('ALL');
  const [selectedKidsAttraction, setSelectedKidsAttraction] = useState(null);
  const [selectedEducationCategory, setSelectedEducationCategory] = useState('ALL');
  const [selectedEducationPoi, setSelectedEducationPoi] = useState(null);
  const [selectedComplementarySpectrum, setSelectedComplementarySpectrum] = useState('ALL');
  const [selectedComplementaryBrand, setSelectedComplementaryBrand] = useState(null);

  // Footfall Range Level Filter & Radius Circle Scope
  const [selectedFootfallRange, setSelectedFootfallRange] = useState('ALL');
  const [scopeToRadiusCircle, setScopeToRadiusCircle] = useState(true);

  // Temporal Dynamic State (24-Hour Diurnal Player)
  const [activeHour, setActiveHour] = useState(21); // Default 9:00 PM peak dessert window
  const [activeDayType, setActiveDayType] = useState('weekend'); // 'weekend' | 'weekday'
  const [isPlayingHour, setIsPlayingHour] = useState(false);

  const [viewState, setViewState] = useState(INDIRANAGAR_2D_VIEW);

  // Load Initial Datasets
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        const b = import.meta.env.BASE_URL;
        const [streetRes, catchmentsRes, apsaraRes, competitorsRes, tpRes, kidsRes, eduRes, compRes] = await Promise.all([
          fetch(`${b}data/all_stores_street_footfall.geojson`).then(r => r.json()),
          fetch(`${b}data/apsara_store_footfall_catchments.geojson`).then(r => r.json()),
          fetch(`${b}data/apsara_ice_cream_bangalore_footfall.json`).then(r => r.json()),
          fetch(`${b}data/layer5_competitors.geojson`).then(r => r.json()).catch(() => null),
          fetch(`${b}data/mapped_tech_parks.geojson`).then(r => r.json()).catch(() => null),
          fetch(`${b}data/kids_family_attractions.geojson`).then(r => r.json()).catch(() => null),
          fetch(`${b}data/education_youth_pois.geojson`).then(r => r.json()).catch(() => null),
          fetch(`${b}data/layer6_complementary_brands.geojson`).then(r => r.json()).catch(() => null)
        ]);

        setStreetFootfallData(streetRes);
        setCatchmentsData(catchmentsRes);
        setApsaraStoresData(apsaraRes);
        if (competitorsRes) setCompetitorsData(competitorsRes);
        if (tpRes) setTechParksData(tpRes);
        if (kidsRes) setKidsAttractionsData(kidsRes);
        if (eduRes) setEducationPoisData(eduRes);
        if (compRes) setComplementaryBrandsData(compRes);

        if (apsaraRes && apsaraRes.length > 0) {
          // Default selection to Indiranagar outlet
          const indiranagarOutlet = apsaraRes.find(s => s.locality === 'Indiranagar') || apsaraRes[0];
          setSelectedApsaraStore(indiranagarOutlet);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load datasets:', err);
        setError('Failed to load footfall and store datasets.');
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // On-demand lazy load for heavy commercial office footprints
  useEffect(() => {
    if (activeLayers.officeFootprints && !officeFootprintsData) {
      const b = import.meta.env.BASE_URL;
      fetch(`${b}data/office_floor_parts.geojson`)
        .then(r => r.json())
        .then(d => setOfficeFootprintsData(d))
        .catch(err => console.error('Failed to load office footprints:', err));
    }
  }, [activeLayers.officeFootprints, officeFootprintsData]);

  // On-demand lazy load for Hexagon Demographics (19.5k H3 Res 9 cells)
  useEffect(() => {
    if (activeLayers.hexDemographics && !hexDemographicsData) {
      const b = import.meta.env.BASE_URL;
      fetch(`${b}data/hexagon_demographics.json`)
        .then(r => r.json())
        .then(d => setHexDemographicsData(d))
        .catch(err => console.error('Failed to load hex demographics:', err));
    }
  }, [activeLayers.hexDemographics, hexDemographicsData]);

  // Automatic 24-Hour Diurnal Timeline Animation Loop
  useEffect(() => {
    let timer;
    if (isPlayingHour) {
      timer = setInterval(() => {
        setActiveHour(h => (h + 1) % 24);
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlayingHour]);

  // Select an Apsara store and fly to its location
  const handleSelectApsaraStore = (store) => {
    setSelectedApsaraStore(store);
    if (store?.coordinates) {
      setViewState(prev => ({
        ...prev,
        longitude: store.coordinates.lng,
        latitude: store.coordinates.lat,
        zoom: 15.2,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  // Change competitor brand filter and ensure clean store state
  const handleSelectBrandFilter = (brand) => {
    setSelectedBrandFilter(brand);
    setActiveLayers(prev => ({ ...prev, competitors: true }));
    if (selectedCompetitor && brand !== 'ALL' && selectedCompetitor.properties?.brand !== brand) {
      setSelectedCompetitor(null);
    }
  };

  // Select a competitor parlor and fly to its location
  const handleSelectCompetitor = (competitor) => {
    setSelectedCompetitor(competitor);
    setActiveLayers(prev => ({ ...prev, competitors: true }));
    if (competitor?.properties?.brand && selectedBrandFilter !== 'ALL' && selectedBrandFilter !== competitor.properties.brand) {
      setSelectedBrandFilter(competitor.properties.brand);
    }
    if (competitor?.geometry?.coordinates) {
      const [lng, lat] = competitor.geometry.coordinates;
      setViewState(prev => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15.6,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  // Change kids category filter and ensure active layer
  const handleSelectKidsCategory = (category) => {
    setSelectedKidsCategory(category);
    setActiveLayers(prev => ({ ...prev, kidsAttractions: true }));
    if (selectedKidsAttraction && category !== 'ALL' && selectedKidsAttraction.properties?.category !== category) {
      setSelectedKidsAttraction(null);
    }
  };

  // Select a kids attraction and fly to its location
  const handleSelectKidsAttraction = (attraction) => {
    setSelectedKidsAttraction(attraction);
    setActiveLayers(prev => ({ ...prev, kidsAttractions: true }));
    if (attraction?.properties?.category && selectedKidsCategory !== 'ALL' && selectedKidsCategory !== attraction.properties.category) {
      setSelectedKidsCategory(attraction.properties.category);
    }
    if (attraction?.geometry?.coordinates) {
      const [lng, lat] = attraction.geometry.coordinates;
      setViewState(prev => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15.6,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  // Change education category filter and ensure active layer
  const handleSelectEducationCategory = (category) => {
    setSelectedEducationCategory(category);
    setActiveLayers(prev => ({ ...prev, educationPois: true }));
    if (selectedEducationPoi && category !== 'ALL' && selectedEducationPoi.properties?.category !== category) {
      setSelectedEducationPoi(null);
    }
  };

  // Select an education institution and fly to its location
  const handleSelectEducationPoi = (poi) => {
    setSelectedEducationPoi(poi);
    setActiveLayers(prev => ({ ...prev, educationPois: true }));
    if (poi?.properties?.category && selectedEducationCategory !== 'ALL' && selectedEducationCategory !== poi.properties.category) {
      setSelectedEducationCategory(poi.properties.category);
    }
    if (poi?.geometry?.coordinates) {
      const [lng, lat] = poi.geometry.coordinates;
      setViewState(prev => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15.6,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  // Change complementary spectrum category filter and ensure active layer
  const handleSelectComplementarySpectrum = (spectrum) => {
    setSelectedComplementarySpectrum(spectrum);
    setActiveLayers(prev => ({ ...prev, complementaryBrands: true }));
    if (selectedComplementaryBrand && spectrum !== 'ALL' && selectedComplementaryBrand.properties?.spectrum_category !== spectrum) {
      setSelectedComplementaryBrand(null);
    }
  };

  // Select a complementary brand venue and fly to its location
  const handleSelectComplementaryBrand = (venue) => {
    setSelectedComplementaryBrand(venue);
    setActiveLayers(prev => ({ ...prev, complementaryBrands: true }));
    if (venue?.properties?.spectrum_category && selectedComplementarySpectrum !== 'ALL' && selectedComplementarySpectrum !== venue.properties.spectrum_category) {
      setSelectedComplementarySpectrum(venue.properties.spectrum_category);
    }
    if (venue?.geometry?.coordinates) {
      const [lng, lat] = venue.geometry.coordinates;
      setViewState(prev => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15.6,
        pitch: 0,
        bearing: 0,
        transitionDuration: 900
      }));
    }
  };

  // Reset to Bangalore City View showing all stores
  const resetCityView = () => {
    setViewState({
      longitude: 77.625,
      latitude: 12.975,
      zoom: 11.5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 850
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-700 font-mono space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-900 text-sm">Loading Apsara & Competitor Footfall Intelligence</p>
          <p className="text-xs text-slate-500 mt-0.5">Fetching Bangalore outlets, competitor parlors & street network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#EBF0F5] flex flex-col items-center justify-center text-slate-800 font-mono p-4">
        <div className="observatory-card p-6 rounded-xl border border-red-300 max-w-md text-center space-y-2">
          <p className="font-bold text-red-600 text-sm">Data Loading Error</p>
          <p className="text-xs text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded text-xs hover:bg-slate-800 transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#EBF0F5] overflow-hidden select-none">
      {/* 1. Header Bar: Apsara Store Selector & Controls */}
      <HeaderBar
        activeHour={activeHour}
        activeDayType={activeDayType}
        setActiveDayType={setActiveDayType}
        onResetCityView={resetCityView}
        apsaraStores={apsaraStoresData}
        selectedApsaraStore={selectedApsaraStore}
        onSelectApsaraStore={handleSelectApsaraStore}
        onOpenApsaraModal={() => setShowApsaraModal(true)}
      />

      {/* 2. Main 2D Map Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <MapViewport
          streetFootfallData={streetFootfallData}
          catchmentsData={catchmentsData}
          apsaraStoresData={apsaraStoresData}
          competitorsData={competitorsData}
          kidsAttractionsData={kidsAttractionsData}
          selectedKidsCategory={selectedKidsCategory}
          selectedKidsAttraction={selectedKidsAttraction}
          onSelectKidsAttraction={handleSelectKidsAttraction}
          complementaryBrandsData={complementaryBrandsData}
          selectedComplementarySpectrum={selectedComplementarySpectrum}
          selectedComplementaryBrand={selectedComplementaryBrand}
          onSelectComplementaryBrand={handleSelectComplementaryBrand}
          educationPoisData={educationPoisData}
          selectedEducationCategory={selectedEducationCategory}
          selectedEducationPoi={selectedEducationPoi}
          onSelectEducationPoi={handleSelectEducationPoi}
          techParksData={techParksData}
          officeFootprintsData={officeFootprintsData}
          hexDemographicsData={hexDemographicsData}
          demographicGender={demographicGender}
          demographicAge={demographicAge}
          selectedBrandFilter={selectedBrandFilter}
          selectedCompetitor={selectedCompetitor}
          onSelectCompetitor={handleSelectCompetitor}
          activeLayers={activeLayers}
          selectedApsaraStore={selectedApsaraStore}
          onSelectApsaraStore={handleSelectApsaraStore}
          viewState={viewState}
          setViewState={setViewState}
          activeHour={activeHour}
          activeDayType={activeDayType}
          selectedFootfallRange={selectedFootfallRange}
          scopeToRadiusCircle={scopeToRadiusCircle}
        />

        {/* 3. Top Right Floating Controls: Layer Toggles & In-Panel Competitor/Kids Selectors */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto flex flex-col items-end space-y-2">
          {/* Layer Control Widget with embedded Conqueror Brand & Kids Category selection */}
          <LayerControlWidget
            activeLayers={activeLayers}
            setActiveLayers={setActiveLayers}
            competitorsData={competitorsData}
            selectedBrandFilter={selectedBrandFilter}
            setSelectedBrandFilter={handleSelectBrandFilter}
            selectedCompetitor={selectedCompetitor}
            onSelectCompetitor={handleSelectCompetitor}
            kidsAttractionsData={kidsAttractionsData}
            selectedKidsCategory={selectedKidsCategory}
            setSelectedKidsCategory={handleSelectKidsCategory}
            selectedKidsAttraction={selectedKidsAttraction}
            onSelectKidsAttraction={handleSelectKidsAttraction}
            complementaryBrandsData={complementaryBrandsData}
            selectedComplementarySpectrum={selectedComplementarySpectrum}
            setSelectedComplementarySpectrum={handleSelectComplementarySpectrum}
            selectedComplementaryBrand={selectedComplementaryBrand}
            onSelectComplementaryBrand={handleSelectComplementaryBrand}
            educationPoisData={educationPoisData}
            selectedEducationCategory={selectedEducationCategory}
            setSelectedEducationCategory={handleSelectEducationCategory}
            selectedEducationPoi={selectedEducationPoi}
            onSelectEducationPoi={handleSelectEducationPoi}
            demographicGender={demographicGender}
            setDemographicGender={setDemographicGender}
            demographicAge={demographicAge}
            setDemographicAge={setDemographicAge}
            selectedFootfallRange={selectedFootfallRange}
            setSelectedFootfallRange={setSelectedFootfallRange}
            scopeToRadiusCircle={scopeToRadiusCircle}
            setScopeToRadiusCircle={setScopeToRadiusCircle}
            streetFootfallData={streetFootfallData}
            selectedApsaraStore={selectedApsaraStore}
            activeHour={activeHour}
            activeDayType={activeDayType}
          />

          {/* Footfall Intensity Legend (Active when street footfall layer is visible) */}
          {activeLayers.streetFootfall && (
            <TopRightLegend
              viewState={viewState}
              activeHour={activeHour}
              activeDayType={activeDayType}
              selectedFootfallRange={selectedFootfallRange}
              onSelectFootfallRange={setSelectedFootfallRange}
            />
          )}
        </div>

        {/* 4. Simple 2D Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center space-x-1 observatory-card p-1 rounded-lg border border-slate-300 bg-white/95 backdrop-blur shadow-md">
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.min(18, v.zoom + 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setViewState(v => ({ ...v, zoom: Math.max(10, v.zoom - 0.75), transitionDuration: 250 }))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-mono text-sm font-bold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* 5. Bottom 24-Hour Diurnal Timeline Scrubber & Live Flow Readout */}
      <div className="relative z-20 w-full shrink-0">
        <BottomTransectBar
          activeHour={activeHour}
          setActiveHour={setActiveHour}
          activeDayType={activeDayType}
          isPlayingHour={isPlayingHour}
          setIsPlayingHour={setIsPlayingHour}
        />
      </div>

      {/* 6. Apsara Store Register Modal */}
      {showApsaraModal && (
        <ApsaraDossierModal
          apsaraStores={apsaraStoresData}
          selectedApsaraStore={selectedApsaraStore}
          onSelectApsaraStore={handleSelectApsaraStore}
          onClose={() => setShowApsaraModal(false)}
        />
      )}
    </div>
  );
}
