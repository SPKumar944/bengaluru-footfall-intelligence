import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// InSAR / Scientific Yellow-Orange-Red Color Ramp
function getScientificRampColor(val, min = 0, max = 2500, alpha = 230) {
  const norm = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
  if (norm < 0.45) {
    const t = norm / 0.45;
    const r = Math.round(254 + t * (249 - 254));
    const g = Math.round(240 + t * (115 - 240));
    const b = Math.round(138 + t * (22 - 138));
    return [r, g, b, alpha];
  } else {
    const t = (norm - 0.45) / 0.55;
    const r = Math.round(249 + t * (220 - 249));
    const g = Math.round(115 + t * (38 - 115));
    const b = Math.round(22 + t * (38 - 22));
    return [r, g, b, 255];
  }
}

export default function MapViewport({
  streetFootfallData,
  catchmentsData,
  apsaraStoresData = [],
  competitorsData,
  activeLayers = {
    streetFootfall: true,
    catchments: true,
    apsaraStores: true,
    competitors: false
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

  // Deck.gl Layers
  const deckLayers = [
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
        if (isPrime) {
          return hrVal > 1500 ? 5.5 : 4.0;
        }
        return hrVal > 400 ? 2.5 : 1.5;
      },
      getLineColor: f => {
        const hourly = f.properties.hourly_footfall;
        const hrVal = hourly ? hourly[activeHour] : 100;
        const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
        const scaled = hrVal * mult;
        return getScientificRampColor(scaled, 30, 2400, 230);
      },
      updateTriggers: {
        getLineColor: [activeHour, activeDayType],
        getLineWidth: [activeHour]
      },
      onHover: info => setHoverInfo(info)
    }),

    // 3. Competitor Ice Cream Parlors Across Bengaluru (108 Outlets)
    activeLayers.competitors && competitorsData?.features && new ScatterplotLayer({
      id: 'competitor-parlors-layer',
      data: competitorsData.features,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 6,
      radiusMaxPixels: 13,
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: [255, 255, 255, 255],
      getFillColor: f => {
        const b = (f.properties?.brand || '').toLowerCase();
        if (b.includes('corner house')) return [147, 51, 234, 240]; // Purple
        if (b.includes('natural')) return [16, 185, 129, 240]; // Emerald
        if (b.includes('polar bear')) return [14, 165, 233, 240]; // Cyan
        if (b.includes('milano')) return [245, 158, 11, 240]; // Amber
        if (b.includes('stoner')) return [249, 115, 22, 240]; // Orange
        if (b.includes('baskin')) return [236, 72, 153, 240]; // Pink
        return [100, 116, 139, 220]; // Slate
      },
      getPosition: f => f.geometry.coordinates,
      onHover: info => setHoverInfo(info)
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
        onViewStateChange={({ viewState: newViewState }) => {
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
                  {hoverInfo.object.google_rating}★ ({hoverInfo.object.google_review_count} rev)
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
                    🔥 ~{hoverInfo.object.regional_footfall.peak_evening_hourly_flow.toLocaleString()}/hr (7-11 PM)
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
                        {p.rating_proxy}★
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

              // Case C: Street Footfall Vector Segment
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
