import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  Printer, 
  Sparkles,
  Target
} from 'lucide-react';

export default function Top5HotspotsPanel({
  executiveReports,
  selectedRegion,
  onSelectRegion
}) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!executiveReports || executiveReports.length === 0) return null;

  const current = selectedRegion || executiveReports[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-96 glass-panel rounded-xl p-4 flex flex-col space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto text-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#272F3E] pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-amber-400" />
          <div>
            <h2 className="font-serif text-sm font-semibold tracking-wide text-white">
              Engagement Model 2: Top 5 Hotspots
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Bengaluru Tier-1 City Site Suitability
            </span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 font-mono text-[10px]"
          title="Print Executive Dossier"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* Top 5 Region Selector Cards */}
      <div className="space-y-1.5 shrink-0">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
          Shortlisted Expansion Hotspots
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {executiveReports.map((r) => {
            const isSelected = current.region_id === r.region_id;
            return (
              <div
                key={r.region_id}
                onClick={() => onSelectRegion(r)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/20 to-cyan-500/10 border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : 'bg-[#181F2C]/70 border-[#222938] hover:bg-[#181F2C] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{r.rank}
                  </span>
                  <div className="truncate">
                    <div className="font-serif text-xs font-semibold text-white truncate">
                      {r.region_name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {r.zone} • {r.hub_type}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-amber-400 block">
                    {r.suitability_score} <span className="text-[9px] text-slate-400 font-normal">pts</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 block font-semibold">
                    ₹{r.projected_monthly_revenue_lakhs}L/mo
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Hotspot Detailed Audit Dossier */}
      {current && (
        <div className="bg-[#0E131E]/95 border border-[#272F3E] rounded-xl p-3.5 space-y-3.5 shadow-xl">
          {/* Active Title & Badges */}
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold">
                Hotspot #{current.rank} Dossier
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                Zero Cannibalization
              </span>
            </div>
            <h3 className="font-serif text-base font-bold text-white tracking-tight mt-1.5">
              {current.region_name}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Nearest Polar Bear Store: <span className="text-cyan-400 font-bold">{current.min_dist_to_existing_pb_km} km away</span> (&gt; 1.2km Shield)
            </p>
          </div>

          {/* Core Projected KPIs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#181F2C] border border-[#222938] p-2.5 rounded-lg">
              <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block">
                Daily Cup Demand
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-base font-bold text-cyan-400">
                  {current.projected_daily_cups.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">cups/d</span>
              </div>
            </div>

            <div className="bg-[#181F2C] border border-[#222938] p-2.5 rounded-lg">
              <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block">
                Monthly Revenue
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-base font-bold text-amber-400">
                  ₹{current.projected_monthly_revenue_lakhs}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Lakhs</span>
              </div>
            </div>
          </div>

          {/* Sub-Score Breakdown (35% Demand, 30% Footfall, 20% Synergy, 15% Gap) */}
          <div className="space-y-1.5 text-[10px] font-mono">
            <span className="uppercase text-slate-400 tracking-wider block">
              Suitability Multi-Criteria Breakdown
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded bg-[#181F2C]/70 border border-[#222938]">
                <span className="text-slate-400 block">Demand (35%):</span>
                <span className="font-bold text-slate-200">{current.scores.demand_score} / 100</span>
              </div>
              <div className="p-2 rounded bg-[#181F2C]/70 border border-[#222938]">
                <span className="text-slate-400 block">Footfall (30%):</span>
                <span className="font-bold text-slate-200">{current.scores.footfall_score} / 100</span>
              </div>
              <div className="p-2 rounded bg-[#181F2C]/70 border border-[#222938]">
                <span className="text-slate-400 block">Synergy (20%):</span>
                <span className="font-bold text-slate-200">{current.scores.synergy_score} / 100</span>
              </div>
              <div className="p-2 rounded bg-[#181F2C]/70 border border-[#222938]">
                <span className="text-slate-400 block">White-Space Gap:</span>
                <span className="font-bold text-emerald-400">{current.scores.white_space_gap} / 100</span>
              </div>
            </div>
          </div>

          {/* Catchment Breakdown Table */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
              Isochrone Catchment Metrics
            </span>
            <div className="border border-[#222938] rounded-lg overflow-hidden font-mono text-[10px]">
              <table className="w-full text-left">
                <thead className="bg-[#181F2C] text-slate-400">
                  <tr>
                    <th className="p-1.5">Catchment</th>
                    <th className="p-1.5 text-right">Population</th>
                    <th className="p-1.5 text-right">Households</th>
                    <th className="p-1.5 text-right">Cup Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222938] text-slate-300">
                  <tr className="hover:bg-emerald-950/20">
                    <td className="p-1.5 text-emerald-400 font-semibold">5-Min Walk</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.walk_5min.population.toLocaleString()}</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.walk_5min.households.toLocaleString()}</td>
                    <td className="p-1.5 text-right text-cyan-400 font-bold">{current.catchment_metrics.walk_5min.daily_cups_share}</td>
                  </tr>
                  <tr className="hover:bg-blue-950/20">
                    <td className="p-1.5 text-blue-400 font-semibold">10-Min Drive</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.drive_10min.population.toLocaleString()}</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.drive_10min.households.toLocaleString()}</td>
                    <td className="p-1.5 text-right text-cyan-400 font-bold">{current.catchment_metrics.drive_10min.daily_cups_share}</td>
                  </tr>
                  <tr className="hover:bg-purple-950/20">
                    <td className="p-1.5 text-purple-400 font-semibold">15-Min Delivery</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.delivery_15min.population.toLocaleString()}</td>
                    <td className="p-1.5 text-right">{current.catchment_metrics.delivery_15min.households.toLocaleString()}</td>
                    <td className="p-1.5 text-right text-cyan-400 font-bold">{current.catchment_metrics.delivery_15min.daily_cups_share}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Rationale Narrative */}
          <div className="bg-[#181F2C]/60 p-2.5 rounded-lg border border-[#222938] text-[11px] text-slate-300 leading-relaxed font-sans">
            <span className="font-serif font-bold text-white block mb-0.5">Executive Rationale:</span>
            {current.strategic_rationale}
          </div>
        </div>
      )}
    </div>
  );
}
