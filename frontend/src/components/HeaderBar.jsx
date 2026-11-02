import React, { useState } from 'react';
import { 
  FileText, 
  Target, 
  Printer, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

export default function HeaderBar({
  engagementMode,
  setEngagementMode,
  resetCityView,
  showLayerDock,
  setShowLayerDock
}) {
  return (
    <header className="observatory-header relative z-30 px-5 py-2 flex items-center justify-between select-none">
      {/* Left: Scientific Header & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          <span>SPATIAL INTELLIGENCE OBSERVATORY</span>
          <span>•</span>
          <span>BENGALURU URBAN</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">1,260 GRID CELLS</span>
          <span>•</span>
          <span>108 TRACKED OUTLETS</span>
        </div>
        <div className="flex items-baseline space-x-2.5 mt-0.5">
          <h1 className="font-serif text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Site Suitability Observatory
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              Polar Bear Expansion Engine
            </span>
          </h1>
          <span className="hidden xl:inline text-xs font-mono text-slate-500">
            BBMP Limits (EPSG:32643) • 1.2km Franchise Cannibalization Shield
          </span>
        </div>
      </div>

      {/* Center: Mode Switcher Pills */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => setEngagementMode('model2_top5')}
          className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            engagementMode === 'model2_top5'
              ? 'bg-slate-900 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Model 2: Top 5 Hotspots</span>
        </button>

        <button
          onClick={() => setEngagementMode('model1_audit')}
          className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            engagementMode === 'model1_audit'
              ? 'bg-slate-900 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Model 1: Single Site Audit</span>
        </button>
      </div>

      {/* Right: Operational Controls */}
      <div className="flex items-center space-x-2">
        {/* Layer Visibility Drawer Toggle */}
        <button
          onClick={() => setShowLayerDock(!showLayerDock)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
            showLayerDock
              ? 'bg-amber-500/10 border-amber-500 text-amber-700 font-bold'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span>Layers ({showLayerDock ? 'Open' : 'Configure'})</span>
        </button>

        {/* 2D Planar Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>2D Planar GIS</span>
        </div>

        {/* Reset City View */}
        <button
          onClick={resetCityView}
          className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Reset to Full City Overview"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Print / Export Report */}
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          title="Print Client Executive Dossier"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
}
