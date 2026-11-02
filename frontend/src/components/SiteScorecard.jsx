import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Compass, 
  Coffee, 
  Train, 
  ChevronRight, 
  Search,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import RadarChartProfile from './RadarChartProfile';

export default function SiteScorecard({
  candidateSites,
  selectedSite,
  onSelectSite
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const filteredSites = (candidateSites || []).filter(site => 
    site.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`w-96 glass-panel rounded-xl flex flex-col text-xs font-sans transition-all duration-300 max-h-[calc(100vh-6rem)] ${
      isMinimized ? 'h-12 overflow-hidden' : 'p-4 overflow-y-auto'
    }`}>
      {/* Header with Minimize Toggle */}
      <div className="flex items-center justify-between border-b border-[#272F3E] pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <h2 className="font-serif text-sm font-semibold tracking-wide text-white">
            Expansion Hub Inspector
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Top 20 Sites
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col space-y-4 pt-3">
          {/* Active Site Detailed Scorecard */}
          {selectedSite ? (
            <div className="bg-[#0E131E]/90 border border-[#272F3E] rounded-xl p-3.5 space-y-3.5 shadow-lg">
              {/* Site Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold">
                      #{selectedSite.rank}
                    </span>
                    <h3 className="font-serif text-base font-bold text-white tracking-tight">
                      {selectedSite.site_name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{selectedSite.zone} Zone</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{selectedSite.site_type}</span>
                  </p>
                </div>
              </div>

              {/* Top Projected Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#181F2C] border border-[#222938] p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block">
                    Daily Cup Volume
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-lg font-bold text-cyan-400">
                      {selectedSite.projected_daily_cups.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">cups/day</span>
                  </div>
                </div>

                <div className="bg-[#181F2C] border border-[#222938] p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block">
                    Monthly Revenue (Est.)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-lg font-bold text-amber-400">
                      ₹{selectedSite.projected_monthly_revenue_lakhs.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Lakhs</span>
                  </div>
                </div>
              </div>

              {/* White Space & Cannibalization Gauges */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                  <span className="text-emerald-300">White-Space Yield</span>
                  <span className="font-bold text-emerald-400 text-xs">{selectedSite.white_space_score}/100</span>
                </div>
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
                  <span className="text-rose-300">Cannibalization Risk</span>
                  <span className="font-bold text-rose-400 text-xs">{selectedSite.cannibalization_risk_pct}%</span>
                </div>
              </div>

              {/* Catchment Breakdown Table */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
                  Multi-Tier Catchment Breakdown
                </span>
                <div className="border border-[#222938] rounded-lg overflow-hidden font-mono text-[10px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#181F2C] text-slate-400">
                      <tr>
                        <th className="p-1.5">Isochrone</th>
                        <th className="p-1.5 text-right">Population</th>
                        <th className="p-1.5 text-right">Dining</th>
                        <th className="p-1.5 text-right">Rivals</th>
                        <th className="p-1.5 text-right">Cups</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222938] text-slate-300">
                      <tr className="hover:bg-emerald-950/20">
                        <td className="p-1.5 flex items-center gap-1 text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 5m Walk
                        </td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_5min_walk.catchment_population.toLocaleString()}</td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_5min_walk.dining_pois}</td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_5min_walk.competitors}</td>
                        <td className="p-1.5 text-right text-cyan-400 font-semibold">{selectedSite.catchment_5min_walk.daily_cup_share}</td>
                      </tr>
                      <tr className="hover:bg-blue-950/20">
                        <td className="p-1.5 flex items-center gap-1 text-blue-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 10m Drive
                        </td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_10min_drive.catchment_population.toLocaleString()}</td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_10min_drive.dining_pois}</td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_10min_drive.competitors}</td>
                        <td className="p-1.5 text-right text-cyan-400 font-semibold">{selectedSite.catchment_10min_drive.daily_cup_share}</td>
                      </tr>
                      <tr className="hover:bg-purple-950/20">
                        <td className="p-1.5 flex items-center gap-1 text-purple-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> 15m Delivery
                        </td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_15min_delivery.catchment_population.toLocaleString()}</td>
                        <td className="p-1.5 text-right">-</td>
                        <td className="p-1.5 text-right">{selectedSite.catchment_15min_delivery.competitors}</td>
                        <td className="p-1.5 text-right text-cyan-400 font-semibold">{selectedSite.catchment_15min_delivery.daily_cup_share}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Radar Chart Profile */}
              <RadarChartProfile profile={selectedSite.radar_profile} />
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#0E131E] border border-dashed border-[#272F3E] text-center text-slate-400 font-mono text-xs">
              Select a candidate hub from the leaderboard below to inspect its 5/10/15-min catchment isochrones.
            </div>
          )}

          {/* Candidate Leaderboard */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Bengaluru Expansion Leaderboard ({filteredSites.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search micro-market or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181F2C] border border-[#272F3E] text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Leaderboard List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredSites.map((site) => {
                const isSelected = selectedSite && selectedSite.site_id === site.site_id;
                return (
                  <div
                    key={site.site_id}
                    onClick={() => onSelectSite(site)}
                    className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-950/20'
                        : 'bg-[#181F2C]/70 border-[#222938] hover:bg-[#181F2C] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {site.rank}
                      </span>
                      <div className="truncate">
                        <div className="font-serif text-xs font-semibold text-white truncate">
                          {site.site_name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {site.zone} • ₹{site.projected_monthly_revenue_lakhs}L/mo
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                        {site.white_space_score} pts
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        {site.projected_daily_cups} cups/d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
