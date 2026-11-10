import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer, TextLayer, IconLayer } from '@deck.gl/layers';
import { getOutlinePin } from '../utils/iconMcpPins';
import { 
  getSpectrumIcon, 
  getEducationIcon, 
  getKidsIcon, 
  IceCreamIcon, 
  SundaeIcon, 
  BuildingIcon 
} from './IconMCP';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { Hexagon } from 'lucide-react';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Helper for extracting demographic metric based on selected Gender and Age filters
export function getHexDemographicMetricValue(d, genderFilter = 'all', ageFilter = 'all') {
  if (!d) return 0;
  if (ageFilter === 'kids') {
    if (genderFilter === 'male') return d.mk || 0;
    if (genderFilter === 'female') return d.fk || 0;
    return d.k || 0;
  }
  if (ageFilter === 'youth') {
    if (genderFilter === 'male') return d.my || 0;
    if (genderFilter === 'female') return d.fy || 0;
    return d.y || 0;
  }
  if (ageFilter === 'adults') {
    if (genderFilter === 'male') return d.mw || 0;
    if (genderFilter === 'female') return d.fw || 0;
    return d.w || 0;
  }
  if (ageFilter === 'seniors') {
    if (genderFilter === 'male') return d.ms || 0;
    if (genderFilter === 'female') return d.fs || 0;
    return d.s || 0;
  }
  // ageFilter === 'all'
  if (genderFilter === 'male') return d.m || 0;
  if (genderFilter === 'female') return d.f || 0;
  return d.pop || 0;
}

// Color scale for Hexagon Demographics layer based on selected gender & age
export function getHexDemographicColor(d, genderFilter = 'all', ageFilter = 'all') {
  let val = 0;
  let maxRef = 1000;

  if (ageFilter === 'kids') {
    maxRef = (genderFilter === 'all') ? 280 : 145;
    if (genderFilter === 'male') val = d.mk || 0;
    else if (genderFilter === 'female') val = d.fk || 0;
    else val = d.k || 0;
  } else if (ageFilter === 'youth') {
    maxRef = (genderFilter === 'all') ? 250 : 130;
    if (genderFilter === 'male') val = d.my || 0;
    else if (genderFilter === 'female') val = d.fy || 0;
    else val = d.y || 0;
  } else if (ageFilter === 'adults') {
    maxRef = (genderFilter === 'all') ? 650 : 330;
    if (genderFilter === 'male') val = d.mw || 0;
    else if (genderFilter === 'female') val = d.fw || 0;
    else val = d.w || 0;
  } else if (ageFilter === 'seniors') {
    maxRef = (genderFilter === 'all') ? 250 : 130;
    if (genderFilter === 'male') val = d.ms || 0;
    else if (genderFilter === 'female') val = d.fs || 0;
    else val = d.s || 0;
  } else {
    // ageFilter === 'all'
    maxRef = (genderFilter === 'all') ? 1400 : 700;
    if (genderFilter === 'male') val = d.m || 0;
    else if (genderFilter === 'female') val = d.f || 0;
    else val = d.pop || 0;
  }

  const ratio = Math.min(1.0, Math.max(0.0, val / Math.max(1, maxRef)));

  // Female Segment: Rose / Crimson gradient
  if (genderFilter === 'female') {
    if (ratio < 0.15) return [251, 113, 133, 40];
    if (ratio < 0.35) return [244, 63, 94, 85];
    if (ratio < 0.65) return [225, 29, 72, 140];
    return [190, 18, 60, 200];
  }

  // Male Segment: Azure / Sky gradient
  if (genderFilter === 'male') {
    if (ratio < 0.15) return [56, 189, 248, 40];
    if (ratio < 0.35) return [14, 165, 233, 85];
    if (ratio < 0.65) return [2, 132, 199, 140];
    return [3, 105, 161, 200];
  }

  // All Genders:
  // If Kids filter is selected -> Warm Amber/Orange (ice cream family footfall magnet!)
  if (ageFilter === 'kids') {
    if (ratio < 0.15) return [251, 191, 36, 45];
    if (ratio < 0.35) return [245, 158, 11, 95];
    if (ratio < 0.65) return [217, 119, 6, 150];
    return [180, 83, 9, 215];
  }

  // If Youth filter is selected -> Indigo
  if (ageFilter === 'youth') {
    if (ratio < 0.15) return [165, 180, 252, 45];
    if (ratio < 0.35) return [129, 140, 248, 95];
    if (ratio < 0.65) return [99, 102, 241, 150];
    return [67, 56, 202, 215];
  }

  // If Seniors filter is selected -> Teal
  if (ageFilter === 'seniors') {
    if (ratio < 0.15) return [94, 234, 212, 45];
    if (ratio < 0.35) return [45, 212, 191, 95];
    if (ratio < 0.65) return [13, 148, 136, 150];
    return [17, 94, 89, 215];
  }

  // Default All Ages / Adults -> Emerald
  if (ratio < 0.15) return [110, 231, 183, 40];
  if (ratio < 0.35) return [52, 211, 153, 85];
  if (ratio < 0.65) return [16, 185, 129, 140];
  return [4, 120, 87, 200];
}

// Diurnal Thermal Footfall Ramp
// Shifts from night cool slate -> dawn pale gold -> midday warm amber -> peak evening incandescent crimson
export function getDiurnalStreetColor(flow) {
  if (flow < 40) {
    // Night quiet baseline: very subtle cool slate
    return [148, 163, 184, 75];
  } else if (flow < 150) {
    // Early dawn / low residential flow: soft warm transition into yellow
    const t = (flow - 40) / 110.0;
    return [
      Math.round(148 + t * (250 - 148)),
      Math.round(163 + t * (204 - 163)),
      Math.round(184 + t * (21 - 184)),
      Math.round(75 + t * (190 - 75))
    ];
  } else if (flow < 500) {
    // Moderate daytime flow: bright golden yellow to warm amber
    const t = (flow - 150) / 350.0;
    return [
      Math.round(250 + t * (249 - 250)),
      Math.round(204 + t * (115 - 204)),
      Math.round(21 + t * (22 - 21)),
      Math.round(190 + t * (230 - 190))
    ];
  } else if (flow < 1500) {
    // Heavy commercial flow: vibrant radiant orange to vermilion
    const t = (flow - 500) / 1000.0;
    return [
      Math.round(249 + t * (220 - 249)),
      Math.round(115 + t * (38 - 115)),
      Math.round(22 + t * (38 - 22)),
      245
    ];
  } else {
    // Prime peak corridors: deep incandescent crimson red
    const t = Math.min(1.0, (flow - 1500) / 2500.0);
    return [
      Math.round(220 + t * (153 - 220)),
      Math.round(38 + t * (0 - 38)),
      Math.round(38 + t * (0 - 38)),
      255
    ];
  }
}

export function getDiurnalStreetWidth(flow, isPrime) {
  if (flow < 40) return 1.0;
  if (flow < 150) return 1.3;
  if (flow < 500) return isPrime ? 2.8 : 1.8;
  if (flow < 1500) return isPrime ? 4.2 : 2.8;
  return isPrime ? 5.8 : 4.0;
}

export default function MapViewport({
  streetFootfallData,
  catchmentsData,
  apsaraStoresData = [],
  competitorsData,
  kidsAttractionsData,
  selectedKidsCategory = 'ALL',
  selectedKidsAttraction,
  onSelectKidsAttraction,
  complementaryBrandsData,
  selectedComplementarySpectrum = 'ALL',
  selectedComplementaryBrand,
  onSelectComplementaryBrand,
  educationPoisData,
  selectedEducationCategory = 'ALL',
  selectedEducationPoi,
  onSelectEducationPoi,
  techParksData,
  officeFootprintsData,
  wardDemographicsData,
  hexDemographicsData,
  demographicGender = 'all',
  demographicAge = 'all',
  selectedBrandFilter = 'ALL',
  selectedCompetitor,
  onSelectCompetitor,
  activeLayers = {
    streetFootfall: true,
    catchments: true,
    apsaraStores: true,
    competitors: false,
    kidsAttractions: true,
    complementaryBrands: true,
    techParks: false,
    officeFootprints: false,
    hexDemographics: false,
    educationPois: true
  },
  selectedApsaraStore,
  onSelectApsaraStore,
  viewState,
  setViewState,
  activeHour = 21,
  activeDayType = 'weekend'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  // Initialize MapLibre in 2D Positron Mode
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_POSITRON,
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: 0,
        bearing: 0,
        interactive: false,
        attributionControl: false
      });
      mapRef.current = map;
    }
  }, []);

  // Sync camera (forced pitch: 0, bearing: 0)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: 0,
        bearing: 0
      });
    }
  }, [viewState]);

  // Filter competitor parlors by selected brand
  const filteredCompetitors = useMemo(() => {
    if (!competitorsData?.features) return [];
    if (!selectedBrandFilter || selectedBrandFilter === 'ALL') {
      return competitorsData.features;
    }
    return competitorsData.features.filter(f => f.properties?.brand === selectedBrandFilter);
  }, [competitorsData, selectedBrandFilter]);

  // Filter kids & family attractions by selected category
  const filteredKidsAttractions = useMemo(() => {
    if (!kidsAttractionsData?.features) return [];
    if (!selectedKidsCategory || selectedKidsCategory === 'ALL') {
      return kidsAttractionsData.features;
    }
    return kidsAttractionsData.features.filter(f => f.properties?.category === selectedKidsCategory);
  }, [kidsAttractionsData, selectedKidsCategory]);

  // Filter complementary dining brands by selected spectrum category
  const filteredComplementaryBrands = useMemo(() => {
    if (!complementaryBrandsData?.features) return [];
    if (!selectedComplementarySpectrum || selectedComplementarySpectrum === 'ALL') {
      return complementaryBrandsData.features;
    }
    return complementaryBrandsData.features.filter(f => f.properties?.spectrum_category === selectedComplementarySpectrum);
  }, [complementaryBrandsData, selectedComplementarySpectrum]);

  // Filter education & youth institutions by selected category
  const filteredEducationPois = useMemo(() => {
    if (!educationPoisData?.features) return [];
    if (!selectedEducationCategory || selectedEducationCategory === 'ALL') {
      return educationPoisData.features;
    }
    return educationPoisData.features.filter(f => f.properties?.category === selectedEducationCategory);
  }, [educationPoisData, selectedEducationCategory]);

  // Deck.gl Layers
  const deckLayers = [
    // 0a. Demographics Information (H3 Hexagon Grid with constant thin hairline border)
    (activeLayers.hexDemographics || activeLayers.wardDemographics) && hexDemographicsData && new H3HexagonLayer({
      id: 'hex-demographics-layer',
      data: hexDemographicsData,
      pickable: true,
      wireframe: false,
      filled: true,
      stroked: true,
      extruded: false,
      coverage: 1.0,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 1.0,
      getLineWidth: 0.75,
      getLineColor: [255, 255, 255, 90], // Constantly maintained crisp thin hairline
      getHexagon: d => d.h,
      getFillColor: d => getHexDemographicColor(d, demographicGender, demographicAge),
      updateTriggers: {
        getFillColor: [demographicGender, demographicAge]
      },
      onHover: info => {
        if (!info?.object) {
          setHoverInfo(null);
        } else {
          setHoverInfo(info);
        }
      }
    }),

    // 0b. Commercial Office Building Footprints (3,137 Polygons)
    activeLayers.officeFootprints && officeFootprintsData?.features && new GeoJsonLayer({
      id: 'office-footprints-layer',
      data: officeFootprintsData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      getLineWidth: 1,
      getLineColor: [79, 70, 229, 180], // Indigo outline
      getFillColor: f => {
        const fl = f.properties?.floor_m2 || 1000;
        if (fl > 20000) return [99, 102, 241, 140]; // High corporate density
        if (fl > 8000) return [129, 140, 248, 110];
        return [165, 180, 252, 85];
      },
      onHover: info => setHoverInfo(info)
    }),

    // 1. High-Density 350m Pedestrian Catchment Zones for all 13 Outlets
    activeLayers.catchments && catchmentsData?.features && new GeoJsonLayer({
      id: 'apsara-store-catchments-layer',
      data: catchmentsData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: [217, 119, 6, 160], // Amber-600 perimeter
      getFillColor: [245, 158, 11, 28], // Soft amber translucent glow
      onHover: info => setHoverInfo(info)
    }),

    // 2. Comprehensive Street Network Footfall Across ALL 13 Locations
    activeLayers.streetFootfall && streetFootfallData?.features && new GeoJsonLayer({
      id: 'all-stores-street-footfall-layer',
      data: streetFootfallData,
      pickable: true,
      stroked: true,
      filled: false,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: f => {
        const isPrime = f.properties.is_prime_corridor;
        const hrVal = f.properties.hourly_footfall?.[activeHour] || 100;
        const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
        const flow = Math.round(hrVal * mult);
        return getDiurnalStreetWidth(flow, isPrime);
      },
      getLineColor: f => {
        const hourly = f.properties.hourly_footfall;
        const hrVal = hourly ? hourly[activeHour] : 100;
        const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
        const flow = Math.round(hrVal * mult);
        return getDiurnalStreetColor(flow);
      },
      updateTriggers: {
        getLineColor: [activeHour, activeDayType],
        getLineWidth: [activeHour, activeDayType]
      },
      onHover: info => setHoverInfo(info)
    }),

    // 2b. Tech Parks & IT Campuses (IconMCP Black Outline Building Pins)
    activeLayers.techParks && techParksData?.features && new IconLayer({
      id: 'tech-parks-layer',
      data: techParksData.features,
      pickable: true,
      getPosition: f => f.geometry.coordinates,
      getIcon: () => getOutlinePin('tech_park'),
      getSize: 26,
      sizeUnits: 'pixels',
      sizeScale: 1,
      onHover: info => setHoverInfo(info)
    }),

    // 2c. Kids & Family Footfall Magnets (IconMCP Black Outline Pins: Toys, Arcades, Theatres, Parks)
    activeLayers.kidsAttractions && filteredKidsAttractions.length > 0 && new IconLayer({
      id: 'kids-attractions-layer',
      data: filteredKidsAttractions,
      pickable: true,
      getPosition: f => f.geometry.coordinates,
      getIcon: f => {
        const cat = f.properties?.category || '';
        if (cat.includes('Toy') || cat.includes('Hamleys')) return getOutlinePin('kids_toys');
        if (cat.includes('Play') || cat.includes('Arcade') || cat.includes('Theme')) return getOutlinePin('kids_play');
        if (cat.includes('Theatre') || cat.includes('Multiplex')) return getOutlinePin('kids_theatre');
        return getOutlinePin('kids_parks');
      },
      getSize: f => selectedKidsAttraction?.properties?.id === f.properties?.id ? 36 : 28,
      sizeUnits: 'pixels',
      sizeScale: 1,
      updateTriggers: {
        getSize: [selectedKidsAttraction?.properties?.id]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectKidsAttraction) {
          onSelectKidsAttraction(info.object);
        }
      }
    }),

    // 2d. Pulsing Selection Ring for Selected Kids Attraction
    activeLayers.kidsAttractions && selectedKidsAttraction?.geometry?.coordinates && new ScatterplotLayer({
      id: 'kids-attraction-selected-pulse',
      data: [selectedKidsAttraction],
      pickable: false,
      stroked: true,
      filled: false,
      radiusScale: 1,
      radiusMinPixels: 22,
      radiusMaxPixels: 34,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [15, 23, 42, 220],
      getPosition: f => f.geometry.coordinates
    }),

    // 2e. Educational & Youth Institutions (IconMCP Black Outline Pins: Schools, Colleges, Coaching, Sports)
    activeLayers.educationPois && filteredEducationPois.length > 0 && new IconLayer({
      id: 'education-youth-pois-layer',
      data: filteredEducationPois,
      pickable: true,
      getPosition: f => f.geometry.coordinates,
      getIcon: f => {
        const cat = f.properties?.category;
        if (cat === 'School') return getOutlinePin('school');
        if (cat === 'College') return getOutlinePin('college');
        if (cat === 'Coaching Institute') return getOutlinePin('coaching');
        return getOutlinePin('sports');
      },
      getSize: f => selectedEducationPoi?.properties?.id === f.properties?.id ? 36 : 28,
      sizeUnits: 'pixels',
      sizeScale: 1,
      updateTriggers: {
        getSize: [selectedEducationPoi?.properties?.id]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectEducationPoi) {
          onSelectEducationPoi(info.object);
        }
      }
    }),

    // 2f. Pulsing Selection Ring for Selected Education Institution
    activeLayers.educationPois && selectedEducationPoi?.geometry?.coordinates && new ScatterplotLayer({
      id: 'education-poi-selected-pulse',
      data: [selectedEducationPoi],
      pickable: false,
      stroked: true,
      filled: false,
      radiusScale: 1,
      radiusMinPixels: 22,
      radiusMaxPixels: 34,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [15, 23, 42, 220],
      getPosition: f => f.geometry.coordinates
    }),

    // 2g. Complementary Brands & High-Footfall Transit / Retail Hubs (IconMCP Black Outline Pins)
    activeLayers.complementaryBrands && filteredComplementaryBrands.length > 0 && new IconLayer({
      id: 'complementary-brands-iconmcp-layer',
      data: filteredComplementaryBrands,
      pickable: true,
      getPosition: f => f.geometry.coordinates,
      getIcon: f => getOutlinePin(f.properties?.spectrum_category),
      getSize: f => selectedComplementaryBrand?.properties?.id === f.properties?.id ? 36 : 28,
      sizeUnits: 'pixels',
      sizeScale: 1,
      updateTriggers: {
        getSize: [selectedComplementaryBrand?.properties?.id],
        getIcon: [selectedComplementarySpectrum]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectComplementaryBrand) {
          onSelectComplementaryBrand(info.object);
        }
      }
    }),

    // 2h. Pulsing Selection Ring for Selected Complementary Brand
    activeLayers.complementaryBrands && selectedComplementaryBrand?.geometry?.coordinates && new ScatterplotLayer({
      id: 'complementary-brand-selected-pulse',
      data: [selectedComplementaryBrand],
      pickable: false,
      stroked: true,
      filled: false,
      radiusScale: 1,
      radiusMinPixels: 22,
      radiusMaxPixels: 34,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [15, 23, 42, 220],
      getPosition: f => f.geometry.coordinates
    }),

    // 3. Competitor Ice Cream Parlors Across Bengaluru (IconMCP Black Outline Sundae Store Pins)
    activeLayers.competitors && filteredCompetitors.length > 0 && new IconLayer({
      id: 'competitor-parlors-layer',
      data: filteredCompetitors,
      pickable: true,
      getPosition: f => f.geometry.coordinates,
      getIcon: () => getOutlinePin('competitor'),
      getSize: f => selectedCompetitor?.properties?.store_id === f.properties?.store_id ? 34 : 26,
      sizeUnits: 'pixels',
      sizeScale: 1,
      updateTriggers: {
        getSize: [selectedCompetitor?.properties?.store_id]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectCompetitor) {
          onSelectCompetitor(info.object);
        }
      }
    }),

    // 3b. Pulsing Selection Ring for Selected Competitor Parlor
    activeLayers.competitors && selectedCompetitor?.geometry?.coordinates && new ScatterplotLayer({
      id: 'competitor-selected-pulse',
      data: [selectedCompetitor],
      pickable: false,
      stroked: true,
      filled: false,
      radiusScale: 1,
      radiusMinPixels: 22,
      radiusMaxPixels: 34,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [15, 23, 42, 220],
      getPosition: f => f.geometry.coordinates
    }),

    // 4. Apsara Ice Cream Outlets Across Bangalore (Hero Client Brand - Prominent IconMCP Outline Pin)
    activeLayers.apsaraStores && apsaraStoresData.length > 0 && new IconLayer({
      id: 'apsara-icecream-stores-layer',
      data: apsaraStoresData,
      pickable: true,
      getPosition: d => [d.coordinates.lng, d.coordinates.lat],
      getIcon: () => getOutlinePin('apsara'),
      getSize: d => selectedApsaraStore?.serial_no === d.serial_no ? 40 : 32,
      sizeUnits: 'pixels',
      sizeScale: 1,
      updateTriggers: {
        getSize: [selectedApsaraStore?.serial_no]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectApsaraStore) {
          onSelectApsaraStore(info.object);
        }
      }
    }),

    // 5. Pulsing Selection Ring for Selected Apsara Store
    activeLayers.apsaraStores && selectedApsaraStore && new ScatterplotLayer({
      id: 'apsara-store-selected-pulse',
      data: [selectedApsaraStore],
      pickable: false,
      stroked: true,
      filled: false,
      radiusScale: 1,
      radiusMinPixels: 24,
      radiusMaxPixels: 36,
      lineWidthUnits: 'pixels',
      getLineWidth: 3,
      getLineColor: [15, 23, 42, 240],
      getPosition: d => [d.coordinates.lng, d.coordinates.lat]
    }),
  ].filter(Boolean);

  return (
    <div className="relative w-full h-full bg-[#EBF0F5] overflow-hidden">
      {/* 1. Underlying MapLibre GL Basemap */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. Deck.gl WebGL Canvas */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState, interactionState }) => {
          if (interactionState?.isDragging) {
            setHoverInfo(null);
          }
          setViewState({
            ...newViewState,
            pitch: 0,
            bearing: 0
          });
        }}
        controller={{
          dragRotate: false,
          touchRotate: false,
          keyboard: false
        }}
        layers={deckLayers}
        className="absolute inset-0 z-10"
      />

      {/* 3. Floating Coordinate & Time HUD */}
      <div className="absolute bottom-4 left-4 z-20 observatory-card px-3 py-1.5 rounded-lg text-[10px] font-mono text-ink-500 border border-ink-950/[0.1] pointer-events-none shadow-sm bg-white/95 backdrop-blur-md">
        <span>LAT: {viewState.latitude.toFixed(4)}°N</span>
        <span className="mx-2 text-ink-300">|</span>
        <span>LON: {viewState.longitude.toFixed(4)}°E</span>
        <span className="mx-2 text-ink-300">|</span>
        <span>ZOOM: {viewState.zoom.toFixed(1)}</span>
        <span className="mx-2 text-ink-300">|</span>
        <span className="text-azure-700 font-bold">TIME: {activeHour}:00 ({activeDayType})</span>
      </div>

      {/* 4. Inspection Tooltips */}
      {hoverInfo?.object && (
        <div
          className="absolute z-30 pointer-events-none observatory-card p-3 rounded-xl shadow-[0_1px_2px_rgba(13,21,33,0.04),0_10px_28px_-20px_rgba(13,21,33,0.18)] text-xs font-mono border border-ink-950/[0.12] bg-white min-w-[240px]"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y + 14 }}
        >
          {/* Apsara Store Tooltip */}
          {hoverInfo.object.serial_no ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                <span className="text-[10px] uppercase font-bold text-azure-700 bg-azure-500/[0.08] px-2 py-0.5 rounded border border-azure-500/30">
                  {hoverInfo.object.serial_no}
                </span>
                <span className="text-[10px] font-bold text-azure-700">
                  Rating: {hoverInfo.object.google_rating} / 5.0 ({hoverInfo.object.google_review_count} reviews)
                </span>
              </div>
              <div className="text-sm font-extrabold text-ink-950">
                Apsara Ice Creams — {hoverInfo.object.locality}
              </div>
              <div className="text-[10px] text-ink-400 line-clamp-2">
                {hoverInfo.object.address}
              </div>

              <div className="pt-1.5 border-t border-ink-950/[0.08] space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-500">Est. Daily Footfall:</span>
                  <span className="text-azure-700 font-extrabold text-xs font-mono">
                    ~{hoverInfo.object.store_footfall.est_daily_cups} cups/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Monthly Customers:</span>
                  <span className="text-ink-900 font-bold font-mono">
                    ~{hoverInfo.object.store_footfall.est_monthly_customers.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Prime Evening Flow:</span>
                  <span className="text-ink-950 font-bold font-mono">
                    ~{hoverInfo.object.regional_footfall.peak_evening_hourly_flow.toLocaleString()} visitors/hr (7–11 PM)
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-ink-400">Corridor Weekend Traffic:</span>
                  <span className="text-ink-600 font-semibold font-mono">
                    ~{(hoverInfo.object.regional_footfall.weekend_daily_footfall / 1000).toFixed(1)}k / day
                  </span>
                </div>
              </div>
            </div>
          ) : hoverInfo.object.properties ? (
            (() => {
              const p = hoverInfo.object.properties;
              
              // Case A: 350m High-Density Footfall Catchment Zone
              if (p.weekend_daily_footfall && p.store_name) {
                return (
                  <div className="space-y-1.5 min-w-[230px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-azure-700 bg-azure-500/[0.08] px-2 py-0.5 rounded border border-azure-500/30">
                        350m Pedestrian Zone
                      </span>
                      <span className="text-[10px] font-bold text-ink-800">
                        {p.serial_no}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">
                      {p.store_name} — {p.locality}
                    </div>
                    <div className="text-[10px] text-ink-400 line-clamp-1">
                      {p.corridor_name}
                    </div>

                    <div className="pt-1 border-t border-ink-950/[0.08] space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-500">Peak Evening Flow:</span>
                        <span className="text-azure-700 font-extrabold font-mono">
                          ~{p.peak_evening_hourly_flow?.toLocaleString()} visitors/hr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Weekend Footfall:</span>
                        <span className="text-ink-900 font-bold font-mono">
                          ~{p.weekend_daily_footfall?.toLocaleString()} / day
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Est. Store Daily Cups:</span>
                        <span className="text-azure-700 font-bold font-mono">
                          ~{p.est_daily_cups} cups/day
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Case B: Competitor Ice Cream Parlor
              if (p.store_id && p.brand) {
                return (
                  <div className="space-y-1.5 min-w-[220px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-ink-950 bg-paper-100 px-2 py-0.5 rounded border border-ink-950/[0.1] flex items-center gap-1.5">
                        <SundaeIcon size={12} className="text-ink-950 shrink-0" />
                        <span>{p.brand}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700">
                        Rating: {p.rating_proxy} / 5.0
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">{p.store_name}</div>
                    <div className="text-[10px] text-ink-400 line-clamp-2">{p.address}</div>
                    <div className="pt-1 border-t border-ink-950/[0.08] flex justify-between text-[11px]">
                      <span className="text-ink-500">Est. Monthly Volume:</span>
                      <span className="text-ink-950 font-extrabold font-mono">~{p.monthly_cup_volume_est?.toLocaleString()} cups/mo</span>
                    </div>
                  </div>
                );
              }

              // Case Kids & Family Footfall Magnet (Hamleys, Arcades, Theatres, Parks)
              if (p.id?.startsWith('KIDS_')) {
                return (
                  <div className="space-y-1.5 min-w-[260px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-ink-950 bg-paper-100 px-1.5 py-0.5 rounded border border-ink-950/[0.1] flex items-center gap-1.5">
                        {getKidsIcon(p.category, { size: 12, className: 'text-ink-950 shrink-0' })}
                        <span>{p.category}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Synergy: {p.ice_cream_attraction_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">{p.name}</div>
                    <div className="text-[10px] text-ink-500 font-semibold">{p.locality}</div>
                    <div className="text-[9px] text-ink-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-ink-950/[0.06] space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-500">Target Audience:</span>
                        <span className="text-ink-800 font-semibold">{p.target_audience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Monthly Family Traffic:</span>
                        <span className="text-ink-950 font-bold font-mono">~{p.est_monthly_family_footfall?.toLocaleString()} / mo</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-400">Peak Footfall:</span>
                        <span className="text-azure-700 font-semibold">{p.peak_window}</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-ink-700 font-medium italic border-t border-ink-950/[0.06]">
                        {p.ice_cream_synergy}
                      </div>
                    </div>
                  </div>
                );
              }

              // Case Education & Youth Institution (Schools, Colleges, Coaching Hubs, Sports Arenas)
              if (p.id?.startsWith('SCH_') || p.id?.startsWith('COL_') || p.id?.startsWith('COA_') || p.id?.startsWith('ACT_') || p.student_capacity !== undefined) {
                return (
                  <div className="space-y-1.5 min-w-[270px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-ink-950 bg-paper-100 px-1.5 py-0.5 rounded border border-ink-950/[0.1] flex items-center gap-1.5">
                        {getEducationIcon(p.category, { size: 12, className: 'text-ink-950 shrink-0' })}
                        <span>{p.category}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Synergy: {p.synergy_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">{p.name}</div>
                    <div className="text-[10px] text-ink-600 font-semibold">
                      {p.locality} {p.sub_category ? `• ${p.sub_category}` : ''}
                    </div>
                    <div className="text-[9px] text-ink-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-ink-950/[0.06] space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-500">Student Capacity:</span>
                        <span className="text-ink-950 font-bold font-mono">~{p.student_capacity?.toLocaleString()} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Target Cohort:</span>
                        <span className="text-ink-800 font-semibold">{p.target_age_group}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-400">Peak Dessert Window:</span>
                        <span className="text-azure-700 font-semibold">{p.peak_window}</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-ink-700 font-medium italic border-t border-ink-950/[0.06]">
                        {p.dessert_synergy_reason}
                      </div>
                    </div>
                  </div>
                );
              }

              // Case Complementary Brand / High-Footfall Hub (Synergy Spectrum)
              if (p.id?.startsWith('COMP_') || p.spectrum_category) {
                return (
                  <div className="space-y-1.5 min-w-[280px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-ink-950 bg-paper-100 px-1.5 py-0.5 rounded border border-ink-950/[0.1] flex items-center gap-1.5">
                        {getSpectrumIcon(p.spectrum_category, { size: 12, className: 'text-ink-950 shrink-0' })}
                        <span>{p.spectrum_category}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Synergy: {p.synergy_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">{p.name}</div>
                    <div className="text-[10px] text-ink-600 font-semibold">
                      {p.locality} {p.sub_category ? `• ${p.sub_category}` : ''}
                    </div>
                    <div className="text-[9px] text-ink-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-ink-950/[0.06] space-y-0.5 text-[11px]">
                      <div className="text-[10px] font-bold text-ink-800">
                        Pillar: {p.spectrum_pillar}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Peak Footfall / Spillover:</span>
                        <span className="text-ink-950 font-bold">{p.peak_window}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-400">Daily Footfall Volume:</span>
                        <span className="text-ink-800 font-semibold font-mono">~{p.daily_customer_footfall?.toLocaleString()} / day</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-ink-700 font-medium italic border-t border-ink-950/[0.06]">
                        {p.synergy_reason}
                      </div>
                    </div>
                  </div>
                );
              }

              // Case C: Tech Park / IT SEZ Campus
              if (p.kind === 'park' && p.name) {
                return (
                  <div className="space-y-1.5 min-w-[210px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-ink-950 bg-paper-100 px-1.5 py-0.5 rounded border border-ink-950/[0.1] flex items-center gap-1.5">
                        <BuildingIcon size={12} className="text-ink-950 shrink-0" />
                        <span>Tech Park & IT Campus</span>
                      </span>
                      <span className="text-[9px] font-mono font-bold text-ink-500">
                        Corporate Hub
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-ink-500">
                      High-density daytime corporate dessert & bulk catering demand
                    </div>
                  </div>
                );
              }

              // Case E: Commercial Office Building Footprint
              if (p.floor_m2 !== undefined && p.levels !== undefined) {
                const estWorkers = Math.round(p.floor_m2 / 12); // ~12 sqm per desk standard
                return (
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Commercial Office
                      </span>
                      <span className="text-[9px] font-mono text-ink-800 font-bold">
                        {p.levels} Floors
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-ink-500">Total Floor Space:</span>
                      <span className="text-ink-950 font-bold font-mono">{Math.round(p.floor_m2)?.toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Est. Desk Capacity:</span>
                      <span className="text-azure-700 font-bold font-mono">~{estWorkers.toLocaleString()} staff</span>
                    </div>
                  </div>
                );
              }

              // Case F: Hexagon Demographics & Population Grid (H3 Res 9)
              if (p.h && p.pop !== undefined) {
                const activeVal = getHexDemographicMetricValue(p, demographicGender, demographicAge);
                const pctMale = p.pop > 0 ? Math.round((p.m / p.pop) * 100) : 50;
                const pctFemale = 100 - pctMale;

                const genderLabels = { all: 'All Genders', male: 'Male Only', female: 'Female Only' };
                const ageLabels = {
                  all: 'All Ages',
                  kids: 'Kids (0–14 yrs)',
                  youth: 'Youth (15–24 yrs)',
                  adults: 'Working Adults (25–54 yrs)',
                  seniors: 'Seniors (55+ yrs)'
                };

                return (
                  <div className="space-y-2 min-w-[250px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className="text-[10px] uppercase font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 flex items-center gap-1">
                        <Hexagon className="w-2.5 h-2.5 text-azure-600" />
                        H3 Res 9 Hexagon
                      </span>
                      <span className="text-[10px] font-mono text-ink-400">
                        {p.h.slice(0, 10)}...
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-ink-950">
                        {p.w_name ? `${p.w_name} Ward` : 'Greater Bengaluru Metropolitan Area'}
                      </div>
                      {p.corp && (
                        <div className="text-[10px] text-ink-500 font-medium">
                          BBMP Corporation: {p.corp}
                        </div>
                      )}
                    </div>

                    {/* Active Filter Metric Highlight */}
                    <div className="bg-paper-100 border border-ink-950/[0.1] p-1.5 rounded text-[11px] flex justify-between items-center">
                      <div className="text-ink-950 font-medium">
                        <span>{ageLabels[demographicAge] || 'All Ages'}</span>
                        <span className="text-ink-500 text-[10px]"> • {genderLabels[demographicGender] || 'All'}</span>
                      </div>
                      <span className="font-extrabold text-azure-700 text-xs font-mono">
                        {activeVal.toLocaleString()} residents
                      </span>
                    </div>

                    {/* Total Cell Population & Gender Breakdown */}
                    <div className="space-y-1 pt-1 border-t border-ink-950/[0.06] text-[11px]">
                      <div className="flex justify-between font-bold text-ink-950">
                        <span>Total Cell Population:</span>
                        <span className="font-mono">{p.pop.toLocaleString()}</span>
                      </div>

                      {/* Male / Female split bar */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-azure-700 font-semibold font-mono">Male: {p.m} ({pctMale}%)</span>
                          <span className="text-violet-600 font-semibold font-mono">Female: {p.f} ({pctFemale}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden flex">
                          <div className="bg-azure-600 h-full" style={{ width: `${pctMale}%` }} />
                          <div className="bg-violet-500 h-full" style={{ width: `${pctFemale}%` }} />
                        </div>
                      </div>

                      {/* Age Cohort Breakdown */}
                      <div className="pt-1.5 space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-ink-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-azure-500" />
                            Kids & Children (0–14):
                          </span>
                          <span className="font-bold text-ink-950 font-mono">{p.k} ({p.pop > 0 ? Math.round(p.k/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-ink-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            Youth & Students (15–24):
                          </span>
                          <span className="font-bold text-ink-950 font-mono">{p.y} ({p.pop > 0 ? Math.round(p.y/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-ink-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-azure-700" />
                            Working Adults (25–54):
                          </span>
                          <span className="font-bold text-ink-950 font-mono">{p.w} ({p.pop > 0 ? Math.round(p.w/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-ink-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />
                            Mature & Seniors (55+):
                          </span>
                          <span className="font-bold text-ink-950 font-mono">{p.s} ({p.pop > 0 ? Math.round(p.s/p.pop*100) : 0}%)</span>
                        </div>
                      </div>

                      {p.k >= 80 && (
                        <div className="mt-1 text-[9px] font-semibold text-azure-900 bg-azure-500/[0.08] p-1 rounded border border-azure-500/20">
                          High Child Density — Prime Target for Ice Cream Parlor & Kiosk
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Case G: Street Footfall Vector Segment
              const hrVal = p.hourly_footfall?.[activeHour] || 100;
              const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
              const currentFlow = Math.round(hrVal * mult);
              return (
                <div className="space-y-1 min-w-[210px]">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="text-[10px] uppercase font-bold text-red-700">Street Corridor</span>
                    <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                      {activeHour}:00 {activeDayType === 'weekend' ? 'Wknd' : 'Wkd'}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">{p.street_name}</div>
                  <div className="text-[10px] text-slate-500">{p.locality || p.corridor_name || p.corridor_zone}</div>
                  
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Live Hourly Flow:</span>
                    <span className="text-red-700 font-extrabold text-xs">~{currentFlow.toLocaleString()} visitors/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Daily Traffic:</span>
                    <span className="text-slate-800 font-semibold">{p.daily_footfall?.toLocaleString()} / day</span>
                  </div>
                  {p.corridor_tier && (
                    <div className="flex justify-between text-[9px] text-amber-700 font-semibold">
                      <span>Corridor Tier:</span>
                      <span>{p.corridor_tier}</span>
                    </div>
                  )}
                  {p.highway_type && (
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Highway Class:</span>
                      <span className="capitalize">{p.highway_type}</span>
                    </div>
                  )}
                </div>
              );
            })()
          ) : null}
        </div>
      )}
    </div>
  );
}
