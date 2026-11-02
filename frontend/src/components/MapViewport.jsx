import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// InSAR / Scientific Yellow-Orange-Red Color Ramp matching user reference screenshot
// Low (0): Pale Yellow [#FEF9C3] -> Med (50): Amber Orange [#F97316] -> High (100): Crimson Red [#DC2626]
function getScientificRampColor(val, min = 0, max = 100, alpha = 185) {
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
  mobility150mData,
  originFlowsData,
  selectedRegion,
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

  // Filter Origin Footfall Flows for active corridor
  const filteredFlows = useMemo(() => {
    if (!originFlowsData) return [];
    if (!selectedRegion) return originFlowsData.slice(0, 30);
    return originFlowsData.filter(f => 
      f.dest_hub_id === selectedRegion.region_id ||
      selectedRegion.region_name.toLowerCase().includes(f.dest_hub_name?.toLowerCase())
    );
  }, [originFlowsData, selectedRegion]);

  // Pure 2D Footfall Deck.gl Layers (Zero 1km grid, Zero points)
  const deckLayers = [
    // 1. 150m x 150m Micro-Mobility Footfall Grid (Dynamic 24-Hour Diurnal Scaling)
    mobility150mData?.features && new GeoJsonLayer({
      id: 'layer-150m-mobility-footfall-2d',
      data: mobility150mData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false, // Strict 2D
      lineWidthUnits: 'pixels',
      getLineWidth: 0.35,
      getLineColor: [210, 218, 226, 85],
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

    // 2. Customer Footfall Inflow Arcs (2D Inflow Trajectories)
    filteredFlows.length > 0 && new ArcLayer({
      id: 'origin-flows-arc-layer-2d',
      data: filteredFlows,
      pickable: true,
      getWidth: 2.2,
      getSourcePosition: d => d.origin_coords,
      getTargetPosition: d => d.dest_coords,
      getSourceColor: [249, 115, 22, 170], // Orange
      getTargetColor: [220, 38, 38, 240], // Red
      onHover: info => setHoverInfo(info)
    })
  ].filter(Boolean);

  return (
    <div className="relative w-full h-full bg-[#EBF0F5] overflow-hidden">
      {/* 1. Underlying MapLibre GL Basemap */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. Deck.gl WebGL Canvas */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) => {
          // Strict 2D planar enforcement
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

      {/* 3. Floating Scientific Coordinate & Zoom HUD */}
      <div className="absolute bottom-4 left-4 z-20 observatory-card px-2.5 py-1 rounded text-[10px] font-mono text-slate-500 border border-slate-300 pointer-events-none">
        <span>LAT: {viewState.latitude.toFixed(4)}°N</span>
        <span className="mx-2">|</span>
        <span>LON: {viewState.longitude.toFixed(4)}°E</span>
        <span className="mx-2">|</span>
        <span>ZOOM: {viewState.zoom.toFixed(1)}</span>
        <span className="mx-2">|</span>
        <span className="text-red-700 font-bold">{activeHour}:00 ({activeDayType})</span>
      </div>

      {/* 4. Footfall Inspection Tooltip */}
      {hoverInfo?.object && (
        <div
          className="absolute z-30 pointer-events-none observatory-card p-2.5 rounded-lg shadow-xl text-xs font-mono border border-slate-300"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
        >
          {/* 150m Mobility Cell Tooltip */}
          {hoverInfo.object.properties?.cell_id_150m && (() => {
            const p = hoverInfo.object.properties;
            const factor = p.hourly_factors?.[activeHour] ?? 1.0;
            const dayMult = activeDayType === 'weekend' ? 1.42 : 0.88;
            const hourlyVisitors = Math.round((p.unique_visitors_annual / 365.0) * factor * dayMult / 12.0);
            return (
              <div className="space-y-1 min-w-[210px]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-[10px] uppercase font-bold text-red-700">150m Footfall Node</span>
                  <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {activeHour}:00 {activeDayType === 'weekend' ? 'Wknd' : 'Wkd'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{p.hub_name}</div>
                <div className="flex justify-between pt-0.5">
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
                  <span className="text-slate-500">Distance to Strip:</span>
                  <span className="text-slate-600">{p.dist_to_hub_m}m</span>
                </div>
              </div>
            );
          })()}

          {/* Footfall Flow Arc Tooltip */}
          {hoverInfo.object?.origin_name && (
            <div className="space-y-0.5 min-w-[180px]">
              <div className="text-[10px] font-bold text-amber-700 border-b border-slate-200 pb-0.5">
                Visitor Inflow Trajectory
              </div>
              <div className="text-xs text-slate-800">
                <span className="font-semibold">{hoverInfo.object.origin_name}</span> → <span className="font-bold text-red-700">{hoverInfo.object.dest_hub_name}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-0.5">
                <span className="text-slate-500">Travel Distance:</span>
                <span className="font-semibold text-slate-800">{hoverInfo.object.distance_km} km</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Trip Volume Share:</span>
                <span className="font-bold text-red-700">{hoverInfo.object.trip_volume_index}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
