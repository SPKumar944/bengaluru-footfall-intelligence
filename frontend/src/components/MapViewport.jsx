import React, { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// InSAR / Scientific Yellow-Orange-Red Color Ramp
// Low: Yellow [#FEF08A] -> Moderate: Amber [#F97316] -> High: Crimson Red [#DC2626]
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

  // Deck.gl Layer: Actual Indiranagar Street Network Footfall
  const deckLayers = [
    streetFootfallData?.features && new GeoJsonLayer({
      id: 'indiranagar-street-footfall-layer',
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
        <span className="text-red-700 font-bold">ACTIVE TIME: {activeHour}:00 ({activeDayType})</span>
      </div>

      {/* 4. Street Footfall Inspection Tooltip */}
      {hoverInfo?.object && (
        <div
          className="absolute z-30 pointer-events-none observatory-card p-2.5 rounded-lg shadow-2xl text-xs font-mono border border-slate-300 bg-white"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y + 14 }}
        >
          {hoverInfo.object.properties && (() => {
            const p = hoverInfo.object.properties;
            const hrVal = p.hourly_footfall?.[activeHour] || 100;
            const mult = activeDayType === 'weekend' ? 1.35 : 0.9;
            const currentFlow = Math.round(hrVal * mult);
            return (
              <div className="space-y-1 min-w-[210px]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-[10px] uppercase font-bold text-red-700">Indiranagar Street Corridor</span>
                  <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {activeHour}:00 {activeDayType === 'weekend' ? 'Wknd' : 'Wkd'}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900">{p.street_name}</div>
                <div className="text-[10px] text-slate-500">{p.corridor_zone}</div>
                
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Live Hourly Footfall:</span>
                  <span className="text-red-700 font-extrabold text-xs">~{currentFlow.toLocaleString()} visitors/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Daily Traffic:</span>
                  <span className="text-slate-800 font-semibold">{p.daily_footfall?.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peak Window Volume:</span>
                  <span className="text-amber-700 font-bold">~{p.peak_hourly_footfall?.toLocaleString()} / hr (20:00-22:00)</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
