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
import { cellToLatLng } from 'h3-js';
import { Hexagon } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import { 
  FOOTFALL_INDEX_TIERS,
  getFootfallTier,
  getFootfallIndex,
  getDiurnalStreetColor,
  getDiurnalStreetWidth,
  formatHourlyFootfallRange, 
  formatDailyFootfallRange, 
  formatCatchmentDailyRange,
  formatStoreCupVolumeRange,
  formatStoreMonthlyCustomersRange,
  formatMonthlyCupVolumeRange,
  formatVenueTrafficRange,
  formatKidsMonthlyTrafficRange,
  getDayMultiplier
} from '../utils/footfallFormatters';

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



// Great-circle Haversine distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Color scale for H3 Commercial & Residential Land Use Hexagons (H3 Res 9)
export function getH3HubFillColor(d, viewMode = 'pockets') {
  if (viewMode === 'residential') {
    // 0 - 100 Residential Index (Indigo/Blue scale)
    const score = d.res_idx || 0;
    if (score > 60) return [67, 56, 202, 195];   // Deep Royal Indigo
    if (score > 35) return [79, 70, 229, 160];  // Vibrant Indigo
    if (score > 15) return [129, 140, 248, 120]; // Medium Indigo
    if (score > 5)  return [165, 180, 252, 80];  // Soft Lavender
    return [224, 231, 255, 45];                 // Light Tint
  }

  if (viewMode === 'commercial') {
    // 0 - 100 Commercial/Tech Office Index (Amber/Orange scale)
    const score = d.com_idx || 0;
    if (score > 60) return [217, 119, 6, 200];   // Deep Amber/Gold
    if (score > 35) return [245, 158, 11, 165];  // Bright Amber
    if (score > 15) return [251, 191, 36, 125];  // Golden Yellow
    if (score > 5)  return [253, 230, 138, 85];  // Pale Gold
    return [254, 243, 199, 45];                 // Tint
  }

  if (viewMode === 'synergy') {
    // 0 - 100 Retail Footfall Synergy Index (Emerald/Cyan to Violet)
    const score = d.syn_idx || 0;
    if (score > 75) return [16, 185, 129, 200];  // Prime Emerald
    if (score > 55) return [14, 165, 233, 165];  // Bright Azure
    if (score > 40) return [99, 102, 241, 130];  // Indigo
    if (score > 25) return [168, 85, 247, 95];   // Purple
    return [203, 213, 225, 50];                 // Neutral Base
  }

  // Default: 'pockets' (Land Use Classification)
  const cls = d.cls || 'residential';
  if (cls === 'commercial') {
    return [245, 158, 11, 150]; // Amber 500
  }
  if (cls === 'industrial') {
    return [168, 85, 247, 145]; // Purple 500 (Tech / Industrial Park corridors)
  }
  if (cls === 'mixed') {
    return [14, 165, 233, 150]; // Azure / Cyan 500 (Mixed-Use Commercial High-Street + Residences)
  }
  // Residential:
  return [79, 70, 229, 120]; // Indigo 600
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
  h3HubsData,
  commercialResidentialHubsData,
  selectedHubTypeFilter = 'ALL',
  selectedHubMetricView = 'pockets',
  scopeHubsToRadius = true,
  selectedHexagon,
  onSelectHexagon,
  selectedHub,
  onSelectHub,
  demographicGender = 'all',
  demographicAge = 'all',
  selectedBrandFilter = 'ALL',
  selectedCompetitor,
  onSelectCompetitor,
  activeLayers = {
    streetFootfall: true,
    catchments: true,
    apsaraStores: true,
    commercialResidentialHubs: true,
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
  activeDay = 'saturday',
  activeDayType = 'weekend',
  selectedFootfallRange = 'ALL',
  scopeToRadiusCircle = true
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

  // Filter H3 Commercial & Residential Land Use Hexagons (H3 Res 9)
  const filteredH3Hubs = useMemo(() => {
    if (!h3HubsData?.hexagons) return [];
    let list = h3HubsData.hexagons;

    // 1. Classification Filter
    if (selectedHubTypeFilter && selectedHubTypeFilter !== 'ALL') {
      list = list.filter(h => h.cls === selectedHubTypeFilter);
    }

    // 2. Catchment Scope (Within 3.5km of selected Apsara Store)
    if (scopeHubsToRadius && selectedApsaraStore?.coordinates) {
      const sLat = selectedApsaraStore.coordinates.lat;
      const sLng = selectedApsaraStore.coordinates.lng;
      list = list.filter(h => {
        if (h.store === selectedApsaraStore.serial_no && h.dist <= 3500) return true;
        try {
          const [cLat, cLng] = cellToLatLng(h.h);
          return getDistanceMeters(cLat, cLng, sLat, sLng) <= 3500;
        } catch {
          return false;
        }
      });
    }

    return list;
  }, [h3HubsData, selectedHubTypeFilter, scopeHubsToRadius, selectedApsaraStore?.serial_no, selectedApsaraStore?.coordinates?.lat, selectedApsaraStore?.coordinates?.lng]);

  // Backward compatibility fallback for legacy polygon hubs if h3 data not ready
  const filteredHubsData = useMemo(() => {
    if (!commercialResidentialHubsData?.features) return null;
    if (!selectedHubTypeFilter || selectedHubTypeFilter === 'ALL') {
      return commercialResidentialHubsData;
    }
    return {
      type: 'FeatureCollection',
      features: commercialResidentialHubsData.features.filter(
        f => f.properties?.hub_type === selectedHubTypeFilter
      )
    };
  }, [commercialResidentialHubsData, selectedHubTypeFilter]);

  // Filter street footfall data by selected footfall index level and 350m radius circle
  const filteredStreetFootfallData = useMemo(() => {
    if (!streetFootfallData?.features) return null;

    const isFiltered = selectedFootfallRange && selectedFootfallRange !== 'ALL';
    const isRadiusScoped = scopeToRadiusCircle || isFiltered;
    const targetSerial = selectedApsaraStore?.serial_no;
    const mult = getDayMultiplier(activeDay, activeDayType);

    // If completely unfiltered, return full dataset
    if (!isFiltered && !isRadiusScoped) {
      return streetFootfallData;
    }

    const filtered = streetFootfallData.features.filter(f => {
      // 1. Radius circle check (within 380m of store)
      if (isRadiusScoped) {
        if (f.properties.dist_to_store_m > 380) return false;
        if (targetSerial && f.properties.serial_no !== targetSerial) return false;
      }

      // 2. Footfall Level check
      if (!isFiltered) return true;

      const hrVal = f.properties.hourly_footfall?.[activeHour] || 100;
      const flow = Math.round(hrVal * mult);
      const tier = getFootfallTier(flow);

      if (selectedFootfallRange === 'HIGH_7_PLUS') {
        return tier.level >= 7;
      }

      return tier.displayLevel === selectedFootfallRange;
    });

    return {
      type: 'FeatureCollection',
      features: filtered
    };
  }, [
    streetFootfallData, 
    selectedFootfallRange, 
    scopeToRadiusCircle, 
    selectedApsaraStore?.serial_no, 
    activeHour, 
    activeDay,
    activeDayType
  ]);

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

    // 0c. Commercial & Residential Land Use Hexagons (H3 Res 9)
    activeLayers.commercialResidentialHubs && filteredH3Hubs?.length > 0 && new H3HexagonLayer({
      id: 'h3-commercial-residential-layer',
      data: filteredH3Hubs,
      pickable: true,
      wireframe: false,
      filled: true,
      stroked: true,
      extruded: false,
      coverage: 0.96,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 3.0,
      getLineWidth: d => (selectedHexagon && d.h === selectedHexagon.h ? 3.0 : 0.8),
      getLineColor: d => (selectedHexagon && d.h === selectedHexagon.h ? [13, 21, 33, 255] : [255, 255, 255, 110]),
      getHexagon: d => d.h,
      getFillColor: d => getH3HubFillColor(d, selectedHubMetricView),
      updateTriggers: {
        getFillColor: [selectedHubMetricView],
        getLineWidth: [selectedHexagon?.h],
        getLineColor: [selectedHexagon?.h]
      },
      onHover: info => {
        if (!info?.object) {
          setHoverInfo(null);
        } else {
          setHoverInfo(info);
        }
      },
      onClick: info => {
        if (info?.object && onSelectHexagon) {
          onSelectHexagon(info.object);
        }
      }
    }),

    // 0d. Fallback: Polygon Hubs if H3 data is still loading
    activeLayers.commercialResidentialHubs && (!filteredH3Hubs || filteredH3Hubs.length === 0) && filteredHubsData?.features && new GeoJsonLayer({
      id: 'commercial-residential-hubs-layer',
      data: filteredHubsData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.0,
      getLineColor: f => (f.properties?.hub_type === 'commercial' ? [234, 88, 12, 220] : [79, 70, 229, 220]),
      getFillColor: f => (f.properties?.hub_type === 'commercial' ? [249, 115, 22, 45] : [99, 102, 241, 45]),
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info?.object && onSelectHub) {
          onSelectHub(info.object);
        }
      }
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
      getLineWidth: f => {
        const isSelected = selectedApsaraStore && f.properties.serial_no === selectedApsaraStore.serial_no;
        if (isSelected && selectedFootfallRange !== 'ALL') return 3;
        if (isSelected) return 2.2;
        return 1.4;
      },
      getLineColor: f => {
        const isSelected = selectedApsaraStore && f.properties.serial_no === selectedApsaraStore.serial_no;
        if (isSelected && selectedFootfallRange !== 'ALL') {
          const activeTier = FOOTFALL_INDEX_TIERS.find(t => t.displayLevel === selectedFootfallRange);
          if (activeTier) {
            return activeTier.rgb.slice(0, 3).concat(250);
          }
          return [30, 136, 229, 240];
        }
        if (isSelected) return [30, 136, 229, 200];
        return [217, 119, 6, 160]; // Amber-600 perimeter
      },
      getFillColor: f => {
        const isSelected = selectedApsaraStore && f.properties.serial_no === selectedApsaraStore.serial_no;
        if (isSelected && selectedFootfallRange !== 'ALL') {
          const activeTier = FOOTFALL_INDEX_TIERS.find(t => t.displayLevel === selectedFootfallRange);
          if (activeTier) {
            return activeTier.rgb.slice(0, 3).concat(32);
          }
          return [30, 136, 229, 30];
        }
        if (isSelected) return [30, 136, 229, 25];
        return [245, 158, 11, 26]; // Soft amber translucent glow
      },
      updateTriggers: {
        getLineWidth: [selectedApsaraStore?.serial_no, selectedFootfallRange],
        getLineColor: [selectedApsaraStore?.serial_no, selectedFootfallRange],
        getFillColor: [selectedApsaraStore?.serial_no, selectedFootfallRange]
      },
      onHover: info => setHoverInfo(info)
    }),

    // 2. Comprehensive Street Network Footfall Across ALL 13 Locations
    activeLayers.streetFootfall && filteredStreetFootfallData?.features && new GeoJsonLayer({
      id: 'all-stores-street-footfall-layer',
      data: filteredStreetFootfallData,
      pickable: true,
      stroked: true,
      filled: false,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: f => {
        const isPrime = f.properties.is_prime_corridor;
        const hrVal = f.properties.hourly_footfall?.[activeHour] || 100;
        const mult = getDayMultiplier(activeDay, activeDayType);
        const flow = Math.round(hrVal * mult);
        const baseWidth = getDiurnalStreetWidth(flow, isPrime);
        return selectedFootfallRange !== 'ALL' ? Math.max(baseWidth, 3.2) : baseWidth;
      },
      getLineColor: f => {
        const hourly = f.properties.hourly_footfall;
        const hrVal = hourly ? hourly[activeHour] : 100;
        const mult = getDayMultiplier(activeDay, activeDayType);
        const flow = Math.round(hrVal * mult);
        return getDiurnalStreetColor(flow);
      },
      updateTriggers: {
        getLineColor: [activeHour, activeDay, activeDayType, selectedFootfallRange],
        getLineWidth: [activeHour, activeDay, activeDayType, selectedFootfallRange]
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
                    {formatStoreCupVolumeRange(hoverInfo.object.store_footfall.est_daily_cups)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Monthly Customers:</span>
                  <span className="text-ink-900 font-bold font-mono">
                    {formatStoreMonthlyCustomersRange(hoverInfo.object.store_footfall.est_monthly_customers)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Prime Evening Flow:</span>
                  <span className="text-ink-950 font-bold font-mono">
                    {formatHourlyFootfallRange(hoverInfo.object.regional_footfall.peak_evening_hourly_flow)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-ink-400">Corridor Weekend Traffic:</span>
                  <span className="text-ink-600 font-semibold font-mono">
                    {formatCatchmentDailyRange(hoverInfo.object.regional_footfall.weekend_daily_footfall)}
                  </span>
                </div>
              </div>
            </div>
          ) : (hoverInfo.object.properties || hoverInfo.object.h) ? (
            (() => {
              const p = hoverInfo.object.properties || hoverInfo.object;
              
              // Case 0: H3 Commercial & Residential Land Use Hexagons (H3 Res 9)
              if (p.h && p.cls && p.res_idx !== undefined) {
                const clsLabels = {
                  commercial: { label: 'Commercial Hub', icon: '🏢', bg: 'bg-amber-500/10 text-amber-800 border-amber-500/30' },
                  residential: { label: 'Residential Pocket', icon: '🏡', bg: 'bg-indigo-500/10 text-indigo-800 border-indigo-500/30' },
                  industrial: { label: 'Industrial / Tech Corridor', icon: '🏭', bg: 'bg-purple-500/10 text-purple-800 border-purple-500/30' },
                  mixed: { label: 'Mixed-Use High-Street', icon: '⚖️', bg: 'bg-cyan-500/10 text-cyan-800 border-cyan-500/30' }
                };
                const clsMeta = clsLabels[p.cls] || clsLabels.residential;

                return (
                  <div className="space-y-2 min-w-[280px] max-w-[340px]">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1.5">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${clsMeta.bg}`}>
                        <span>{clsMeta.icon} {clsMeta.label}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Synergy: {p.syn_idx}/100
                      </span>
                    </div>

                    {/* Ward & Location Details */}
                    <div>
                      <div className="text-xs font-black text-ink-950">{p.ward}</div>
                      <div className="text-[10px] text-ink-500 flex items-center justify-between mt-0.5 font-mono">
                        <span>H3 Res 9: {p.h.slice(0, 10)}...</span>
                        <span>{Math.round(p.dist)}m from {p.store}</span>
                      </div>
                    </div>

                    {/* Index Progress Bar Charts */}
                    <div className="bg-paper-100 p-2 rounded-lg border border-ink-950/[0.08] space-y-1.5 text-[10px]">
                      <div className="font-bold text-ink-900 border-b border-ink-950/[0.06] pb-0.5 flex justify-between">
                        <span>Index Indicators (0–100)</span>
                        <span className="text-ink-500 text-[9px] font-normal">H3 Res 9 (210m diam)</span>
                      </div>
                      
                      {/* Residential Index Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-indigo-800 font-semibold flex items-center gap-1">
                            <span>🏡</span> Residential Index:
                          </span>
                          <span className="font-mono font-bold text-indigo-900">{p.res_idx} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, p.res_idx))}%` }} />
                        </div>
                      </div>

                      {/* Commercial / Tech Index Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-amber-800 font-semibold flex items-center gap-1">
                            <span>🏢</span> Commercial / Tech:
                          </span>
                          <span className="font-mono font-bold text-amber-900">{p.com_idx} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, p.com_idx))}%` }} />
                        </div>
                      </div>

                      {/* Synergy Score Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-azure-800 font-semibold flex items-center gap-1">
                            <span>⚡</span> Retail Footfall Synergy:
                          </span>
                          <span className="font-mono font-bold text-azure-900">{p.syn_idx} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-azure-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, p.syn_idx))}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Numerical Data Grid */}
                    <div className="pt-1 border-t border-ink-950/[0.08] space-y-1 text-[10px]">
                      <div className="font-bold text-ink-900 text-[10px]">Numerical Metrics:</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-white p-1.5 rounded border border-ink-950/[0.06]">
                        <div>
                          <span className="text-ink-400 block text-[9px]">Resident Pop:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.res_pop.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[9px]">Daytime Workforce:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.com_workers ? p.com_workers.toLocaleString() : '—'}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[9px]">Kids / Youth:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.kids}k / {p.youth}y</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[9px]">Office Built-up:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.off_m2 ? `${Math.round(p.off_m2).toLocaleString()} m²` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[9px]">Residential Space:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.res_built_m2 ? `${Math.round(p.res_built_m2).toLocaleString()} m²` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[9px]">Office Buildings:</span>
                          <span className="font-bold text-ink-900 font-mono">{p.off_cnt ? `${p.off_cnt} bldgs` : '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Rationale */}
                    <div className="pt-0.5 text-[9.5px] text-ink-600 font-medium italic border-t border-ink-950/[0.06]">
                      {p.cls === 'commercial' 
                        ? 'High-density daytime corporate footfall driver. Peak dessert demand during lunch and 4 PM–7 PM post-work hours.'
                        : p.cls === 'mixed'
                        ? 'Balanced mixed-use synergy: steady daytime office flow transitioning into peak evening & weekend family ice cream walk-ins.'
                        : p.cls === 'industrial'
                        ? 'Major tech park / industrial campus corridor. High potential for corporate catering, bulk gifting & delivery orders.'
                        : 'Dense residential neighborhood catchment. Prime generator for 7 PM–11 PM evening family dessert strolls and home delivery.'}
                    </div>
                  </div>
                );
              }

              // Case 0b: Legacy Polygon Urban Pockets (Hubs fallback)
              if (p.hub_id) {
                const isComm = p.hub_type === 'commercial';
                return (
                  <div className="space-y-1.5 min-w-[270px] max-w-[320px]">
                    <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                        isComm 
                          ? 'text-amber-800 bg-amber-500/10 border-amber-500/30' 
                          : 'text-indigo-800 bg-indigo-500/10 border-indigo-500/30'
                      }`}>
                        <span>{isComm ? '🏢 COMMERCIAL HUB' : '🏡 RESIDENTIAL POCKET'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-azure-700 bg-azure-500/[0.08] px-1.5 py-0.5 rounded border border-azure-500/30 font-mono">
                        Synergy: {p.synergy_score}/100
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ink-950 leading-snug">{p.name}</div>
                    <div className="text-[10px] text-ink-500 font-semibold">{p.locality} • {p.category}</div>
                    
                    <div className="pt-1 border-t border-ink-950/[0.06] space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-500">{isComm ? 'Est. Daytime Workforce:' : 'Est. Resident Population:'}</span>
                        <span className="text-ink-950 font-bold font-mono">
                          {p.est_activity ? p.est_activity.toLocaleString() : 'N/A'} {isComm ? 'workers' : 'residents'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">{isComm ? 'Daily Footfall Flow:' : 'Household Density:'}</span>
                        <span className="text-ink-800 font-semibold">
                          {isComm ? `${Math.round(p.daily_footfall).toLocaleString()} pedestrians` : p.household_density}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-400">Peak Demand Window:</span>
                        <span className="text-azure-700 font-semibold">{p.peak_window}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-400">Target Cohort:</span>
                        <span className="text-ink-800 font-medium truncate max-w-[170px]" title={p.dominant_profile}>{p.dominant_profile}</span>
                      </div>
                      {p.anchors && p.anchors.length > 0 && (
                        <div className="pt-1 text-[9px] text-ink-500 flex flex-wrap gap-1 border-t border-ink-950/[0.06]">
                          <span className="font-bold text-ink-700">Anchors:</span>
                          {p.anchors.slice(0, 3).map((a, i) => (
                            <span key={i} className="bg-paper-100 px-1 py-0.2 rounded border border-ink-950/[0.08] text-ink-800 font-medium">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-0.5 text-[10px] text-ink-700 font-medium italic border-t border-ink-950/[0.06]">
                        {p.synergy_rationale}
                      </div>
                    </div>
                  </div>
                );
              }

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
                          {formatHourlyFootfallRange(p.peak_evening_hourly_flow)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Weekend Walkshed:</span>
                        <span className="text-ink-900 font-bold font-mono">
                          {formatCatchmentDailyRange(p.weekend_daily_footfall)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Est. Store Volume:</span>
                        <span className="text-azure-700 font-bold font-mono">
                          {formatStoreCupVolumeRange(p.est_daily_cups)}
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
                      <span className="text-ink-950 font-extrabold font-mono">{formatMonthlyCupVolumeRange(p.monthly_cup_volume_est)}</span>
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
                        <span className="text-ink-950 font-bold font-mono">{formatKidsMonthlyTrafficRange(p.est_monthly_family_footfall)}</span>
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
                        <span className="text-ink-800 font-semibold font-mono">{formatVenueTrafficRange(p.daily_customer_footfall, p.spectrum_category || p.category)}</span>
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
              const mult = getDayMultiplier(activeDay, activeDayType);
              const currentFlow = Math.round(hrVal * mult);
              const tier = getFootfallTier(currentFlow);
              const dayLabel = activeDay ? activeDay.charAt(0).toUpperCase() + activeDay.slice(1, 3) : (activeDayType === 'weekend' ? 'Wknd' : 'Wkd');
              return (
                <div className="space-y-2 min-w-[250px]">
                  <div className="flex justify-between items-center border-b border-ink-950/[0.08] pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-5 h-5 rounded-md font-mono font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ 
                          backgroundColor: tier.hex,
                          color: tier.textColor || '#ffffff'
                        }}
                      >
                        {tier.displayLevel || tier.level}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-ink-950 font-mono tracking-tight">
                        Index: {tier.displayLevel || tier.level}/10 • {tier.tag}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-paper-100 text-ink-700 px-1.5 py-0.5 rounded border border-ink-950/[0.08] font-bold">
                      {activeHour.toString().padStart(2, '0')}:00 {dayLabel}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-extrabold text-ink-950">{p.street_name || 'Corridor Segment'}</div>
                    <div className="text-[10px] text-ink-500 font-medium">{p.locality || p.corridor_name || p.corridor_zone}</div>
                  </div>

                  {/* Index Tier Visual Highlight Banner */}
                  <div 
                    className="p-1.5 rounded-lg border flex items-center justify-between"
                    style={{ 
                      backgroundColor: `${tier.hex}14`,
                      borderColor: `${tier.hex}40`
                    }}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-ink-950">{tier.label}</div>
                      <div className="text-[8.5px] text-ink-500 leading-tight">{tier.description}</div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-mono font-black text-ink-950">{tier.rangeLabel}</div>
                      <div className="text-[8px] uppercase tracking-wider text-ink-400 font-mono">Pedestrians</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-1 border-t border-ink-950/[0.06] text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-500">Daily Cumulative:</span>
                      <span className="text-ink-900 font-bold font-mono">
                        {formatDailyFootfallRange(p.daily_footfall)}
                      </span>
                    </div>
                    {p.corridor_tier && (
                      <div className="flex justify-between text-[10px] text-ink-600 font-medium">
                        <span className="text-ink-400">Corridor Tier:</span>
                        <span className="text-ink-800 font-semibold">{p.corridor_tier}</span>
                      </div>
                    )}
                    {p.dist_to_store_m !== undefined && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-ink-400">Distance to Outlet:</span>
                        <span className={`font-mono font-bold ${p.dist_to_store_m <= 380 ? 'text-azure-700' : 'text-ink-700'}`}>
                          {Math.round(p.dist_to_store_m)}m {p.dist_to_store_m <= 380 ? '(Inside 350m Circle)' : ''}
                        </span>
                      </div>
                    )}
                    {p.highway_type && (
                      <div className="flex justify-between text-[10px] text-ink-400">
                        <span>Road Classification:</span>
                        <span className="capitalize text-ink-600 font-medium">{p.highway_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      )}
    </div>
  );
}
