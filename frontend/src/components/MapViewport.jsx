import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
  selectedBrandFilter = 'ALL',
  selectedCompetitor,
  onSelectCompetitor,
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

  // Filter competitor parlors by selected brand
  const filteredCompetitors = useMemo(() => {
    if (!competitorsData?.features) return [];
    if (!selectedBrandFilter || selectedBrandFilter === 'ALL') {
      return competitorsData.features;
    }
    return competitorsData.features.filter(f => f.properties?.brand === selectedBrandFilter);
  }, [competitorsData, selectedBrandFilter]);

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
