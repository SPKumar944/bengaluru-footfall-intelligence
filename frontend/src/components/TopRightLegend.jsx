import React from 'react';

export default function TopRightLegend({
  viewState,
  activeLayerName,
  minVal = 0,
  maxVal = 100,
  unit = 'pts'
}) {
  return (
    <div className="observatory-card rounded-lg p-2.5 px-3 text-xs font-mono shadow-md border border-[#DCE3EC] min-w-[200px]">
      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        <span className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2 h-2 rounded-sm bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600" />
          {activeLayerName || 'Market Potential Index (IMPI)'}
        </span>
      </div>

      {/* Gradient Bar */}
      <div className="h-2 w-full rounded-sm bg-gradient-to-r from-[#FEF08A] via-[#F97316] to-[#DC2626] border border-slate-300" />

      {/* Range Labels */}
      <div className="flex justify-between text-[9px] text-slate-500 mt-1">
        <span>{minVal}</span>
        <span>50</span>
        <span className="text-red-700 font-bold">{maxVal} {unit}</span>
      </div>

      {/* Coordinates readout */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1.5 mt-1.5 border-t border-slate-200">
        <span>Lat: {viewState.latitude.toFixed(4)}°</span>
        <span>Lon: {viewState.longitude.toFixed(4)}°</span>
        <span className="text-slate-700 font-semibold">Z: {viewState.zoom.toFixed(1)}</span>
      </div>
    </div>
  );
}
