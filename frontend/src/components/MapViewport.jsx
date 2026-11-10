import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
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

    // 2b. Tech Parks & IT Campuses (95 Hubs across Bengaluru)
    activeLayers.techParks && techParksData?.features && new ScatterplotLayer({
      id: 'tech-parks-layer',
      data: techParksData.features,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 7,
      radiusMaxPixels: 14,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getLineColor: [255, 255, 255, 240],
      getFillColor: [14, 165, 233, 235], // Tech Sky Blue
      getPosition: f => f.geometry.coordinates,
      onHover: info => setHoverInfo(info)
    }),

    // 2c. Kids & Family Footfall Magnets (Toy Stores, Play Arcades, Theatres, Parks)
    activeLayers.kidsAttractions && filteredKidsAttractions.length > 0 && new ScatterplotLayer({
      id: 'kids-attractions-layer',
      data: filteredKidsAttractions,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 8,
      radiusMaxPixels: 16,
      lineWidthUnits: 'pixels',
      getLineWidth: f => selectedKidsAttraction?.properties?.id === f.properties?.id ? 3.5 : 2,
      getLineColor: f => selectedKidsAttraction?.properties?.id === f.properties?.id ? [255, 255, 255, 255] : [255, 255, 255, 240],
      getFillColor: f => {
        const cat = f.properties?.category || '';
        if (cat.includes('Toy Store')) return [245, 158, 11, 245]; // Amber / Gold
        if (cat.includes('Play Arena') || cat.includes('Theme Park')) return [236, 72, 153, 245]; // Pink / Magenta
        if (cat.includes('Theatre') || cat.includes('Multiplex')) return [99, 102, 241, 245]; // Indigo
        if (cat.includes('Park') || cat.includes('Garden') || cat.includes('Lake')) return [16, 185, 129, 245]; // Emerald
        return [14, 165, 233, 245]; // Sky Blue (Science/Nature/Zoo)
      },
      getPosition: f => f.geometry.coordinates,
      updateTriggers: {
        getLineWidth: [selectedKidsAttraction?.properties?.id],
        getLineColor: [selectedKidsAttraction?.properties?.id]
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
      radiusMinPixels: 18,
      radiusMaxPixels: 28,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [244, 63, 94, 255], // Distinct vivid rose/pink halo
      getPosition: f => f.geometry.coordinates
    }),

    // 2e. Educational & Youth Institutions (Schools, Colleges, Coaching, Activity Arenas)
    activeLayers.educationPois && filteredEducationPois.length > 0 && new ScatterplotLayer({
      id: 'education-youth-pois-layer',
      data: filteredEducationPois,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 8,
      radiusMaxPixels: 16,
      lineWidthUnits: 'pixels',
      getLineWidth: f => selectedEducationPoi?.properties?.id === f.properties?.id ? 3.5 : 2,
      getLineColor: f => selectedEducationPoi?.properties?.id === f.properties?.id ? [255, 255, 255, 255] : [255, 255, 255, 240],
      getFillColor: f => {
        const cat = f.properties?.category;
        if (cat === 'School') return [245, 158, 11, 245]; // Amber / Gold
        if (cat === 'College') return [99, 102, 241, 245]; // Indigo
        if (cat === 'Coaching Institute') return [6, 182, 212, 245]; // Cyan / Teal
        return [244, 63, 94, 245]; // Rose / Coral for Activity & Sports
      },
      getPosition: f => f.geometry.coordinates,
      updateTriggers: {
        getLineWidth: [selectedEducationPoi?.properties?.id],
        getLineColor: [selectedEducationPoi?.properties?.id]
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
      radiusMinPixels: 18,
      radiusMaxPixels: 28,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [245, 158, 11, 255], // Distinct vivid amber halo
      getPosition: f => f.geometry.coordinates
    }),

    // 2g. Complementary Brands & High-Footfall Transit / Retail Hubs
    activeLayers.complementaryBrands && filteredComplementaryBrands.length > 0 && new ScatterplotLayer({
      id: 'complementary-dining-brands-layer',
      data: filteredComplementaryBrands,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 13,
      radiusMaxPixels: 20,
      lineWidthUnits: 'pixels',
      getLineWidth: f => selectedComplementaryBrand?.properties?.id === f.properties?.id ? 4 : 2,
      getLineColor: f => selectedComplementaryBrand?.properties?.id === f.properties?.id ? [255, 255, 255, 255] : [255, 255, 255, 235],
      getFillColor: f => {
        const cat = f.properties?.spectrum_category;
        if (cat === 'Metro Stations & Transit Terminals') return [14, 165, 233, 245]; // Transit Sky Blue
        if (cat === 'Shopping Malls & Retail Hubs') return [217, 70, 239, 245]; // Magenta / Fuchsia
        if (cat === 'Cinemas & Cultural Auditoriums') return [99, 102, 241, 245]; // Indigo / Violet
        if (cat === 'Street Walkways & Buzzing Hotspots') return [234, 179, 8, 245]; // Golden Sun
        if (cat === 'Hot & Spicy Meals') return [239, 68, 68, 245]; // Fiery Red
        if (cat === 'Youth Fast Casual') return [245, 158, 11, 245]; // Warm Amber
        if (cat === 'Late-Night Pubs & Breweries') return [147, 51, 234, 245]; // Royal Purple
        return [16, 185, 129, 245]; // Emerald for Evening Tiffin
      },
      getPosition: f => f.geometry.coordinates,
      updateTriggers: {
        getLineWidth: [selectedComplementaryBrand?.properties?.id],
        getLineColor: [selectedComplementaryBrand?.properties?.id],
        getFillColor: [selectedComplementarySpectrum]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object && onSelectComplementaryBrand) {
          onSelectComplementaryBrand(info.object);
        }
      }
    }),

    // 2g-ii. Complementary Brands Icon Text Layer (Emoji pins for visual differentiation)
    activeLayers.complementaryBrands && filteredComplementaryBrands.length > 0 && new TextLayer({
      id: 'complementary-brands-icon-layer',
      data: filteredComplementaryBrands,
      pickable: false,
      getPosition: f => f.geometry.coordinates,
      getText: f => f.properties?.spectrum_icon || '📍',
      getSize: f => selectedComplementaryBrand?.properties?.id === f.properties?.id ? 15 : 12,
      sizeUnits: 'pixels',
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", sans-serif',
      updateTriggers: {
        getSize: [selectedComplementaryBrand?.properties?.id]
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
      radiusMinPixels: 18,
      radiusMaxPixels: 28,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [249, 115, 22, 255], // Distinct vivid orange halo
      getPosition: f => f.geometry.coordinates
    }),

    // 3. Competitor Ice Cream Parlors Across Bengaluru (Filtered by Brand if selected)
    activeLayers.competitors && filteredCompetitors.length > 0 && new ScatterplotLayer({
      id: 'competitor-parlors-layer',
      data: filteredCompetitors,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 7,
      radiusMaxPixels: 14,
      lineWidthUnits: 'pixels',
      getLineWidth: f => selectedCompetitor?.properties?.store_id === f.properties?.store_id ? 3 : 1.5,
      getLineColor: f => selectedCompetitor?.properties?.store_id === f.properties?.store_id ? [255, 255, 255, 255] : [255, 255, 255, 230],
      getFillColor: f => {
        const b = (f.properties?.brand || '').toLowerCase();
        if (b.includes('corner house')) return [147, 51, 234, 245]; // Purple
        if (b.includes('natural')) return [16, 185, 129, 245]; // Emerald
        if (b.includes('polar bear')) return [14, 165, 233, 245]; // Cyan
        if (b.includes('milano')) return [245, 158, 11, 245]; // Amber
        if (b.includes('cream stone') || b.includes('stoner')) return [249, 115, 22, 245]; // Orange
        if (b.includes('baskin')) return [236, 72, 153, 245]; // Pink
        if (b.includes('ibaco')) return [99, 102, 241, 245]; // Indigo
        if (b.includes('arun')) return [239, 68, 68, 245]; // Red
        if (b.includes('amul')) return [59, 130, 246, 245]; // Blue
        if (b.includes('pabrai')) return [20, 184, 166, 245]; // Teal
        if (b.includes('kwality')) return [217, 70, 239, 245]; // Fuchsia
        if (b.includes('nic')) return [34, 197, 94, 245]; // Green
        return [100, 116, 139, 220]; // Slate
      },
      getPosition: f => f.geometry.coordinates,
      updateTriggers: {
        getLineWidth: [selectedCompetitor?.properties?.store_id],
        getLineColor: [selectedCompetitor?.properties?.store_id]
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
      radiusMinPixels: 18,
      radiusMaxPixels: 28,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [147, 51, 234, 255], // Distinct vivid purple halo
      getPosition: f => f.geometry.coordinates
    }),

    // 4. Apsara Ice Cream Outlets Across Bangalore
    activeLayers.apsaraStores && apsaraStoresData.length > 0 && new ScatterplotLayer({
      id: 'apsara-icecream-stores-layer',
      data: apsaraStoresData,
      pickable: true,
      opacity: 1,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 8,
      radiusMaxPixels: 15,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [255, 255, 255, 255],
      getFillColor: d => selectedApsaraStore?.serial_no === d.serial_no ? [220, 38, 38, 255] : [245, 158, 11, 240],
      getPosition: d => [d.coordinates.lng, d.coordinates.lat],
      updateTriggers: {
        getFillColor: [selectedApsaraStore?.serial_no]
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
      radiusMinPixels: 18,
      radiusMaxPixels: 26,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getLineColor: [220, 38, 38, 240],
      getPosition: d => [d.coordinates.lng, d.coordinates.lat]
    })
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
      <div className="absolute bottom-4 left-4 z-20 observatory-card px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-600 border border-slate-300 pointer-events-none shadow-sm bg-white/95 backdrop-blur">
        <span>LAT: {viewState.latitude.toFixed(4)}°N</span>
        <span className="mx-2">|</span>
        <span>LON: {viewState.longitude.toFixed(4)}°E</span>
        <span className="mx-2">|</span>
        <span>ZOOM: {viewState.zoom.toFixed(1)}</span>
        <span className="mx-2">|</span>
        <span className="text-red-700 font-bold">TIME: {activeHour}:00 ({activeDayType})</span>
      </div>

      {/* 4. Inspection Tooltips */}
      {hoverInfo?.object && (
        <div
          className="absolute z-30 pointer-events-none observatory-card p-3 rounded-xl shadow-2xl text-xs font-mono border border-slate-300 bg-white min-w-[240px]"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y + 14 }}
        >
          {/* Apsara Store Tooltip */}
          {hoverInfo.object.serial_no ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {hoverInfo.object.serial_no}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  Rating: {hoverInfo.object.google_rating} / 5.0 ({hoverInfo.object.google_review_count} reviews)
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Apsara Ice Creams — {hoverInfo.object.locality}
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-2">
                {hoverInfo.object.address}
              </div>

              <div className="pt-1.5 border-t border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Daily Footfall:</span>
                  <span className="text-red-700 font-extrabold text-xs">
                    ~{hoverInfo.object.store_footfall.est_daily_cups} cups/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Customers:</span>
                  <span className="text-slate-800 font-bold">
                    ~{hoverInfo.object.store_footfall.est_monthly_customers.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prime Evening Flow:</span>
                  <span className="text-amber-700 font-bold">
                    ~{hoverInfo.object.regional_footfall.peak_evening_hourly_flow.toLocaleString()} visitors/hr (7–11 PM)
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Corridor Weekend Traffic:</span>
                  <span className="text-slate-600 font-semibold">
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
                    <div className="flex justify-between items-center border-b border-amber-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        350m Pedestrian Zone
                      </span>
                      <span className="text-[10px] font-bold text-slate-800">
                        {p.serial_no}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {p.store_name} — {p.locality}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {p.corridor_name}
                    </div>

                    <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Peak Evening Flow:</span>
                        <span className="text-red-700 font-extrabold">
                          ~{p.peak_evening_hourly_flow?.toLocaleString()} visitors/hr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weekend Footfall:</span>
                        <span className="text-amber-800 font-bold">
                          ~{p.weekend_daily_footfall?.toLocaleString()} / day
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Est. Store Daily Cups:</span>
                        <span className="text-emerald-700 font-bold">
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
                    <div className="flex justify-between items-center border-b border-purple-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {p.brand}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        Rating: {p.rating_proxy} / 5.0
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">{p.store_name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">{p.address}</div>
                    <div className="pt-1 border-t border-slate-100 flex justify-between text-[11px]">
                      <span className="text-slate-500">Est. Monthly Volume:</span>
                      <span className="text-purple-700 font-extrabold">~{p.monthly_cup_volume_est?.toLocaleString()} cups/mo</span>
                    </div>
                  </div>
                );
              }

              // Case Kids & Family Footfall Magnet (Hamleys, Arcades, Theatres, Parks)
              if (p.id?.startsWith('KIDS_')) {
                return (
                  <div className="space-y-1.5 min-w-[260px]">
                    <div className="flex justify-between items-center border-b border-pink-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Synergy: {p.ice_cream_attraction_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{p.locality}</div>
                    <div className="text-[9px] text-slate-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Audience:</span>
                        <span className="text-slate-800 font-semibold">{p.target_audience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Family Traffic:</span>
                        <span className="text-pink-700 font-bold">~{p.est_monthly_family_footfall?.toLocaleString()} / mo</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Peak Footfall:</span>
                        <span className="text-amber-800 font-semibold">{p.peak_window}</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-emerald-800 font-medium italic border-t border-slate-100">
                        {p.ice_cream_synergy}
                      </div>
                    </div>
                  </div>
                );
              }

              // Case Education & Youth Institution (Schools, Colleges, Coaching Hubs, Sports Arenas)
              if (p.id?.startsWith('SCH_') || p.id?.startsWith('COL_') || p.id?.startsWith('COA_') || p.id?.startsWith('ACT_') || p.student_capacity !== undefined) {
                const badgeStyle = 
                  p.category === 'School' ? 'text-amber-800 bg-amber-50 border-amber-300' :
                  p.category === 'College' ? 'text-indigo-800 bg-indigo-50 border-indigo-300' :
                  p.category === 'Coaching Institute' ? 'text-cyan-800 bg-cyan-50 border-cyan-300' :
                  'text-rose-800 bg-rose-50 border-rose-300';

                return (
                  <div className="space-y-1.5 min-w-[270px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                        {p.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Synergy: {p.synergy_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-600 font-semibold">
                      {p.locality} {p.sub_category ? `• ${p.sub_category}` : ''}
                    </div>
                    <div className="text-[9px] text-slate-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Capacity:</span>
                        <span className="text-slate-900 font-bold">~{p.student_capacity?.toLocaleString()} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Cohort:</span>
                        <span className="text-slate-800 font-semibold">{p.target_age_group}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Peak Dessert Window:</span>
                        <span className="text-amber-800 font-semibold">{p.peak_window}</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-emerald-800 font-medium italic border-t border-slate-100">
                        {p.dessert_synergy_reason}
                      </div>
                    </div>
                  </div>
                );
              }

              // Case Complementary Brand / High-Footfall Hub (Synergy Spectrum)
              if (p.id?.startsWith('COMP_') || p.spectrum_category) {
                const badgeStyle = 
                  p.spectrum_category === 'Metro Stations & Transit Terminals' ? 'text-sky-800 bg-sky-50 border-sky-300' :
                  p.spectrum_category === 'Shopping Malls & Retail Hubs' ? 'text-fuchsia-800 bg-fuchsia-50 border-fuchsia-300' :
                  p.spectrum_category === 'Cinemas & Cultural Auditoriums' ? 'text-indigo-800 bg-indigo-50 border-indigo-300' :
                  p.spectrum_category === 'Street Walkways & Buzzing Hotspots' ? 'text-amber-800 bg-amber-50 border-amber-300' :
                  p.spectrum_category === 'Hot & Spicy Meals' ? 'text-red-800 bg-red-50 border-red-300' :
                  p.spectrum_category === 'Youth Fast Casual' ? 'text-orange-800 bg-orange-50 border-orange-300' :
                  p.spectrum_category === 'Late-Night Pubs & Breweries' ? 'text-purple-800 bg-purple-50 border-purple-300' :
                  'text-emerald-800 bg-emerald-50 border-emerald-300';

                return (
                  <div className="space-y-1.5 min-w-[280px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                        {p.spectrum_icon || '🍽️'} {p.spectrum_category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Synergy: {p.synergy_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-600 font-semibold">
                      {p.locality} {p.sub_category ? `• ${p.sub_category}` : ''}
                    </div>
                    <div className="text-[9px] text-slate-400 line-clamp-1">{p.address}</div>

                    <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px]">
                      <div className="text-[10px] font-bold text-orange-900">
                        Pillar: {p.spectrum_pillar}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Peak Footfall / Spillover:</span>
                        <span className="text-orange-900 font-bold">{p.peak_window}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Daily Footfall Volume:</span>
                        <span className="text-slate-700 font-semibold">~{p.daily_customer_footfall?.toLocaleString()} / day</span>
                      </div>
                      <div className="pt-0.5 text-[10px] text-emerald-800 font-medium italic border-t border-slate-100">
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
                    <div className="flex justify-between items-center border-b border-sky-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        Tech Park & IT Campus
                      </span>
                      <span className="text-[9px] font-bold text-sky-600">
                        Corporate Hub
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
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
                    <div className="flex justify-between items-center border-b border-indigo-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        Commercial Office
                      </span>
                      <span className="text-[9px] font-mono text-indigo-800 font-bold">
                        {p.levels} Floors
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Total Floor Space:</span>
                      <span className="text-indigo-900 font-bold">{Math.round(p.floor_m2)?.toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Desk Capacity:</span>
                      <span className="text-emerald-700 font-bold">~{estWorkers.toLocaleString()} staff</span>
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
                    <div className="flex justify-between items-center border-b border-emerald-200 pb-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Hexagon className="w-2.5 h-2.5 text-emerald-600" />
                        H3 Res 9 Hexagon
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {p.h.slice(0, 10)}...
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {p.w_name ? `${p.w_name} Ward` : 'Greater Bengaluru Metropolitan Area'}
                      </div>
                      {p.corp && (
                        <div className="text-[10px] text-slate-500 font-medium">
                          BBMP Corporation: {p.corp}
                        </div>
                      )}
                    </div>

                    {/* Active Filter Metric Highlight */}
                    <div className="bg-emerald-50/70 border border-emerald-200 p-1.5 rounded text-[11px] flex justify-between items-center">
                      <div className="text-emerald-950 font-medium">
                        <span>{ageLabels[demographicAge] || 'All Ages'}</span>
                        <span className="text-slate-500 text-[10px]"> • {genderLabels[demographicGender] || 'All'}</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-xs">
                        {activeVal.toLocaleString()} residents
                      </span>
                    </div>

                    {/* Total Cell Population & Gender Breakdown */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Total Cell Population:</span>
                        <span>{p.pop.toLocaleString()}</span>
                      </div>

                      {/* Male / Female split bar */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-sky-700 font-semibold">Male: {p.m} ({pctMale}%)</span>
                          <span className="text-rose-600 font-semibold">Female: {p.f} ({pctFemale}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                          <div className="bg-sky-500 h-full" style={{ width: `${pctMale}%` }} />
                          <div className="bg-rose-400 h-full" style={{ width: `${pctFemale}%` }} />
                        </div>
                      </div>

                      {/* Age Cohort Breakdown */}
                      <div className="pt-1.5 space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Kids & Children (0–14):
                          </span>
                          <span className="font-bold text-slate-800">{p.k} ({p.pop > 0 ? Math.round(p.k/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Youth & Students (15–24):
                          </span>
                          <span className="font-bold text-slate-800">{p.y} ({p.pop > 0 ? Math.round(p.y/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Working Adults (25–54):
                          </span>
                          <span className="font-bold text-slate-800">{p.w} ({p.pop > 0 ? Math.round(p.w/p.pop*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            Mature & Seniors (55+):
                          </span>
                          <span className="font-bold text-slate-800">{p.s} ({p.pop > 0 ? Math.round(p.s/p.pop*100) : 0}%)</span>
                        </div>
                      </div>

                      {p.k >= 80 && (
                        <div className="mt-1 text-[9px] font-semibold text-amber-900 bg-amber-50 p-1 rounded border border-amber-200">
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
