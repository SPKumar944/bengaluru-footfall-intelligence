import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer, ArcLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// InSAR / Scientific Yellow-Orange-Red Color Ramp matching user reference screenshot
// Low (0): Pale Yellow [#FEF9C3] -> Med (50): Amber Orange [#F97316] -> High (100): Crimson Red [#DC2626]
function getScientificRampColor(val, min = 0, max = 100, alpha = 180) {
  const norm = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
  if (norm < 0.5) {
    const t = norm / 0.5;
    const r = Math.round(254 + t * (249 - 254));
    const g = Math.round(249 + t * (115 - 249));
    const b = Math.round(195 + t * (22 - 195));
    return [r, g, b, alpha];
  } else {
    const t = (norm - 0.5) / 0.5;
    const r = Math.round(249 + t * (220 - 249));
    const g = Math.round(115 + t * (38 - 115));
    const b = Math.round(22 + t * (38 - 22));
    return [r, g, b, alpha + 25];
  }
}

export default function MapViewport({
  grid1kmData,
  mobility150mData,
  originFlowsData,
  competitorsData,
  complementaryData,
  businessZonesData,
  infraData,
  roadTrafficData,
  top5CatchmentsData,
  layerConfig,
  infraCategoryFilter,
  selectedRegion,
  auditLocation,
  viewState,
  setViewState,
  activeHour = 21,
  activeDayType = 'weekend',
  onMapClick
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

  // Filter Infra Amenities by category
  const filteredInfra = useMemo(() => {
    if (!infraData || !infraData.features) return [];
    if (infraCategoryFilter === 'All') return infraData.features;
    return infraData.features.filter(f => f.properties.category === infraCategoryFilter);
  }, [infraData, infraCategoryFilter]);

  // Filter Existing Polar Bear Stores
  const polarBearStores = useMemo(() => {
    if (!competitorsData || !competitorsData.features) return [];
    return competitorsData.features.filter(f => f.properties.is_client_store === true);
  }, [competitorsData]);

  // Filter Origin Flows
  const filteredFlows = useMemo(() => {
    if (!originFlowsData) return [];
    if (!selectedRegion) return originFlowsData.slice(0, 30);
    return originFlowsData.filter(f => f.dest_hub_id === selectedRegion.region_id);
  }, [originFlowsData, selectedRegion]);

  // Pure 2D Flat Deck.gl Layers
  const deckLayers = [
    // 1. 1km x 1km Macro Grid (Layers 1, 2, 3) — Rendered with Scientific Raster Mesh Ramp
    layerConfig.macro1kmMode !== 'off' && grid1kmData?.features && new GeoJsonLayer({
      id: 'layer-1km-macro-grid-2d',
      data: grid1kmData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: 0.5,
      getLineColor: [180, 195, 210, 130],
      getFillColor: f => {
        const p = f.properties;
        if (layerConfig.macro1kmMode === 'pop') {
          return getScientificRampColor(p.total_population, 5000, 26000, 175);
        }
        if (layerConfig.macro1kmMode === 'pci') {
          return getScientificRampColor(p.avg_per_capita_income_inr, 450000, 1300000, 175);
        }
        if (layerConfig.macro1kmMode === 'fb') {
          return getScientificRampColor(p.annual_fb_spend_inr_lakhs, 2200, 13500, 180);
        }
        // Unmet demand gap
        return getScientificRampColor(p.dessert_icecream_wallet_inr_lakhs, 180, 950, 185);
      },
      updateTriggers: {
        getFillColor: [layerConfig.macro1kmMode]
      },
      onHover: info => setHoverInfo(info)
    }),

    // 2. 150m x 150m Micro Mobility Grid (Layer 4) — Strict 2D Dynamic Temporal Footfall
    layerConfig.showMobility150m && mobility150mData?.features && new GeoJsonLayer({
      id: 'layer-150m-mobility-grid-2d',
      data: mobility150mData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: 0.3,
      getLineColor: [220, 225, 230, 90],
      getFillColor: f => {
        const base = f.properties.unique_visitors_annual || 300000;
        const factors = f.properties.hourly_factors;
        const factor = (factors && factors[activeHour] !== undefined) ? factors[activeHour] : 1.0;
        const dayMult = activeDayType === 'weekend' ? 1.42 : 0.88;
        const dynamicVal = base * factor * dayMult;
        return getScientificRampColor(dynamicVal, 150000, 1600000, 185);
      },
      updateTriggers: {
        getFillColor: [activeHour, activeDayType]
      },
      onHover: info => setHoverInfo(info)
    }),

    // 3. Customer Origin Flows (2D Arc layer)
    layerConfig.showOriginFlows && new ArcLayer({
      id: 'origin-flows-arc-layer-2d',
      data: filteredFlows,
      pickable: true,
      getWidth: 2,
      getSourcePosition: d => d.origin_coords,
      getTargetPosition: d => d.dest_coords,
      getSourceColor: [249, 115, 22, 180], // Orange
      getTargetColor: [220, 38, 38, 240], // Red
      onHover: info => setHoverInfo(info)
    }),

    // 4. Commercial Business Zones (Layer 7 Polygons)
    layerConfig.showBusinessZones && businessZonesData?.features && new GeoJsonLayer({
      id: 'business-zones-layer-2d',
      data: businessZonesData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: [16, 185, 129, 240], // Emerald border
      getFillColor: [16, 185, 129, 25],
      onHover: info => setHoverInfo(info)
    }),

    // 5. Road Evening Traffic Corridors
    layerConfig.showRoadTraffic && roadTrafficData?.features && new GeoJsonLayer({
      id: 'road-traffic-layer-2d',
      data: roadTrafficData,
      pickable: true,
      stroked: true,
      filled: false,
      lineWidthUnits: 'pixels',
      getLineWidth: 3,
      getLineColor: f => {
        const cong = f.properties.congestion_index;
        if (cong >= 85) return [220, 38, 38, 240]; // Red
        if (cong >= 75) return [245, 158, 11, 230]; // Amber
        return [16, 185, 129, 210]; // Green
      },
      onHover: info => setHoverInfo(info)
    }),

    // 6. Top 5 Hotspot Catchments (5/10/15-min Isochrones)
    layerConfig.showIsochrones && top5CatchmentsData?.features && new GeoJsonLayer({
      id: 'top5-isochrones-layer-2d',
      data: top5CatchmentsData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: f => {
        const type = f.properties.catchment_type;
        if (type === '5_min_walk') return [16, 185, 129, 240];
        if (type === '10_min_drive') return [59, 130, 246, 240];
        return [139, 92, 246, 240];
      },
      getFillColor: f => {
        const type = f.properties.catchment_type;
        if (type === '5_min_walk') return [16, 185, 129, 35];
        if (type === '10_min_drive') return [59, 130, 246, 25];
        return [139, 92, 246, 15];
      },
      onHover: info => setHoverInfo(info)
    }),

    // 7. Polar Bear Cannibalization Shield (1.2 km Trade Area Buffer)
    layerConfig.showCannibalizationShield && polarBearStores.length > 0 && new ScatterplotLayer({
      id: 'cannibalization-shield-buffer-2d',
      data: polarBearStores,
      pickable: true,
      stroked: true,
      filled: true,
      radiusUnits: 'meters',
      getRadius: 1200, // 1.2km buffer
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: [6, 182, 212, 200],
      getFillColor: [6, 182, 212, 25],
      getPosition: f => f.geometry.coordinates,
      onHover: info => setHoverInfo(info)
    }),

    // 8. Infrastructure Amenities (Layer 8 Points)
    layerConfig.showInfra && filteredInfra.length > 0 && new ScatterplotLayer({
      id: 'infra-amenities-layer-2d',
      data: filteredInfra,
      pickable: true,
      opacity: 0.9,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 4,
      radiusMaxPixels: 8,
      lineWidthUnits: 'pixels',
      getLineWidth: 1.2,
      getLineColor: [255, 255, 255, 220],
      getPosition: f => f.geometry.coordinates,
      getFillColor: f => {
        const cat = f.properties.category;
        if (cat === 'Railway Station') return [6, 182, 212, 240];
        if (cat === 'Mall') return [236, 72, 153, 240];
        if (cat === 'Cinema') return [168, 85, 247, 240];
        return [59, 130, 246, 230];
      },
      onHover: info => setHoverInfo(info)
    }),

    // 9. Complementary Brand Stores (Layer 6 Points)
    layerConfig.showComplementary && complementaryData?.features && new ScatterplotLayer({
      id: 'complementary-anchors-layer-2d',
      data: complementaryData.features,
      pickable: true,
      opacity: 0.85,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3.5,
      radiusMaxPixels: 6.5,
      lineWidthUnits: 'pixels',
      getLineWidth: 1,
      getLineColor: [255, 255, 255, 200],
      getPosition: f => f.geometry.coordinates,
      getFillColor: [245, 158, 11, 220], // Amber
      onHover: info => setHoverInfo(info)
    }),

    // 10. Competitor Stores (Layer 5 Points) — Polar Bear (Cyan) vs Rivals (Crimson)
    layerConfig.showCompetitors && competitorsData?.features && new ScatterplotLayer({
      id: 'competitor-stores-layer-2d',
      data: competitorsData.features,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: f => f.properties.is_client_store ? 6.5 : 4,
      radiusMaxPixels: f => f.properties.is_client_store ? 11 : 7.5,
      lineWidthUnits: 'pixels',
      getLineWidth: f => f.properties.is_client_store ? 2 : 1.2,
      getLineColor: [255, 255, 255, 240],
      getPosition: f => f.geometry.coordinates,
      getFillColor: f => f.properties.is_client_store ? [6, 182, 212, 255] : [220, 38, 38, 230],
      onHover: info => setHoverInfo(info)
    }),

    // 11. Target Site Marker (Active Focus Hub) — Circular halo matching screenshot
    selectedRegion && new ScatterplotLayer({
      id: 'selected-hub-target-marker',
      data: [{ lat: selectedRegion.coordinates.lat, lon: selectedRegion.coordinates.lon }],
      pickable: false,
      stroked: true,
      filled: true,
      radiusUnits: 'pixels',
      getRadius: 8,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      getLineColor: [15, 23, 42, 255],
      getFillColor: [255, 255, 255, 240],
      getPosition: d => [d.lon, d.lat]
    })
  ].filter(Boolean);

  const handleMapClick = (info) => {
    if (info && info.coordinate) {
      onMapClick(info.coordinate[1], info.coordinate[0]);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#EBF0F5]">
      {/* Background MapLibre Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* 2D DeckGL Overlay — Strict 2D (dragRotate: false) */}
      <DeckGL
        viewState={{ ...viewState, pitch: 0, bearing: 0 }}
        onViewStateChange={({ viewState }) => {
          setViewState(prev => ({
            ...prev,
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: viewState.zoom,
            pitch: 0,
            bearing: 0
          }));
        }}
        controller={{ dragRotate: false, touchRotate: false }}
        layers={deckLayers}
        onClick={handleMapClick}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'crosshair')}
      />

      {/* Floating Scientific Tooltip */}
      {hoverInfo && hoverInfo.object && (
        <div
          className="absolute z-50 pointer-events-none observatory-card rounded-lg p-2.5 text-xs font-mono shadow-xl border border-slate-300"
          style={{ left: hoverInfo.x + 15, top: hoverInfo.y + 15 }}
        >
          {/* 1km Grid Cell Tooltip */}
          {hoverInfo.object.properties?.grid_id_1km && (
            <div className="space-y-1 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="text-[10px] uppercase font-bold text-slate-700">1×1 km Grid Cell</span>
                <span className="text-[9px] text-slate-400">{hoverInfo.object.properties.grid_id_1km}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Population:</span>
                <span className="font-bold text-slate-800">{hoverInfo.object.properties.total_population?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Per Capita:</span>
                <span className="text-emerald-700 font-bold">₹{hoverInfo.object.properties.avg_per_capita_income_inr?.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">F&B Spend:</span>
                <span className="text-amber-700 font-bold">₹{hoverInfo.object.properties.annual_fb_spend_inr_lakhs?.toLocaleString()}L</span>
              </div>
            </div>
          )}

          {/* 150m Mobility Cell Tooltip */}
          {hoverInfo.object.properties?.cell_id_150m && (() => {
            const p = hoverInfo.object.properties;
            const factor = p.hourly_factors?.[activeHour] ?? 1.0;
            const dayMult = activeDayType === 'weekend' ? 1.42 : 0.88;
            const hourlyVisitors = Math.round((p.unique_visitors_annual / 365.0) * factor * dayMult / 12.0);
            return (
              <div className="space-y-1 min-w-[210px]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700">150m Mobility Node</span>
                  <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {activeHour}:00 {activeDayType === 'weekend' ? 'Wknd' : 'Wkd'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{p.hub_name}</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Live Hourly Flow:</span>
                  <span className="text-red-700 font-bold font-mono">~{hourlyVisitors.toLocaleString()} visitors/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual Footfall:</span>
                  <span className="text-slate-700 font-semibold">{p.unique_visitors_annual?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Evening Peak Share:</span>
                  <span className="text-emerald-700 font-bold">{p.evening_footfall_share_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance to Hub:</span>
                  <span className="text-slate-600">{p.dist_to_hub_m}m</span>
                </div>
              </div>
            );
          })()}

          {/* Competitor Tooltip */}
          {hoverInfo.object.properties?.store_name && hoverInfo.object.properties?.category_tier && (
            <div className="space-y-1 min-w-[200px]">
              <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-0.5">
                {hoverInfo.object.properties.store_name}
              </div>
              <div className="text-[10px] text-slate-600">{hoverInfo.object.properties.address}</div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Hours:</span>
                <span className="font-semibold text-slate-700">{hoverInfo.object.properties.opening_hours}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Avg Ticket:</span>
                <span className="font-bold text-amber-700">₹{hoverInfo.object.properties.avg_for_two_inr}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
