import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Flame, 
  Navigation, 
  TrendingUp, 
  Layers, 
  MapPin, 
  ChevronRight,
  Zap,
  Coffee
} from 'lucide-react';

export default function ScientificLeftPanel({
  selectedRegion,
  executiveReports,
  onSelectRegion,
  engagementMode,
  setEngagementMode,
  auditLocation,
  activeHour = 21,
  setActiveHour,
  activeDayType = 'weekend',
  setActiveDayType,
  regionalFootfallMatrix = []
}) {
  const [activeTab, setActiveTab] = useState('regional'); // 'regional' | 'suitability'

  const current = selectedRegion || executiveReports?.[0];

  // Daily demand trajectory simulation data (12-month ramp)
  const demandTrajectory = [
    { month: 'M1', cups: 680, rev: 35.7 },
    { month: 'M2', cups: 740, rev: 38.8 },
    { month: 'M3', cups: 820, rev: 43.0 },
    { month: 'M4', cups: 890, rev: 46.7 },
    { month: 'M5', cups: 960, rev: 50.4 },
    { month: 'M6', cups: 1020, rev: 53.5 },
    { month: 'M7', cups: 1080, rev: 56.7 },
    { month: 'M8', cups: 1119, rev: 58.7 },
    { month: 'M9', cups: 1130, rev: 59.3 },
    { month: 'M10', cups: 1110, rev: 58.2 },
    { month: 'M11', cups: 1140, rev: 59.8 },
    { month: 'M12', cups: 1180, rev: 61.9 }
  ];

  // Lookup regional dynamics profile from matrix
  const currentRegionName = current?.region_name || 'Indiranagar (100ft & 12th Main)';
  const matchedRegionalProfile = regionalFootfallMatrix.find(r => 
    currentRegionName.toLowerCase().includes(r.region_name.toLowerCase()) ||
    r.region_name.toLowerCase().includes(currentRegionName.toLowerCase()) ||
    (currentRegionName.toLowerCase().includes('indiranagar') && r.region_id === 'HUB_INDIRANAGAR')
  ) || regionalFootfallMatrix[0];

  // Hourly series formatted for AreaChart
  const hourlyChartData = matchedRegionalProfile?.hourly_dynamics?.map(h => ({
    hour: h.hour,
    hour_num: h.hour_num,
    label: `${h.hour_num}:00`,
    visitors: activeDayType === 'weekend' ? h.weekend_visitors : h.weekday_visitors,
    dessert_index: h.dessert_propensity_pct,
    isCurrent: h.hour_num === activeHour
  })) || [];

  const currentHourlyStat = matchedRegionalProfile?.hourly_dynamics?.find(h => h.hour_num === activeHour);
  const currentVisitorRate = activeDayType === 'weekend' 
    ? (currentHourlyStat?.weekend_visitors || 8540)
    : (currentHourlyStat?.weekday_visitors || 4100);

  if (!current) return null;

  return (
    <div className="w-[380px] observatory-card rounded-xl p-3.5 flex flex-col space-y-3 max-h-[calc(100vh-10.5rem)] overflow-y-auto text-xs font-sans text-slate-700 bg-white/95 backdrop-blur shadow-2xl">
      {/* Dual Tab Mode Switcher: Regional Footfall vs Site Suitability */}
      <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[10px] font-mono shrink-0">
        <button
          onClick={() => setActiveTab('regional')}
          className={`flex-1 py-1 px-2 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'regional'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>Regional Footfall</span>
        </button>
        <button
          onClick={() => setActiveTab('suitability')}
          className={`flex-1 py-1 px-2 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'suitability'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Site Expansion</span>
        </button>
      </div>

      {/* Quick Regional Hub Selector Chips */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-slate-200 shrink-0">
        {[
          { name: 'Indiranagar', id: 'HUB_INDIRANAGAR', lat: 12.9719, lon: 77.6412 },
          { name: 'Koramangala', id: 'HUB_KORAMANGALA', lat: 12.9352, lon: 77.6245 },
          { name: 'Whitefield', id: 'HUB_WHITEFIELD', lat: 12.9698, lon: 77.7499 },
          { name: 'Bellandur', id: 'HUB_BELLANDUR', lat: 12.9260, lon: 77.6762 },
          { name: 'HSR Layout', id: 'HUB_HSR_LAYOUT', lat: 12.9121, lon: 77.6446 },
          { name: 'JP Nagar', id: 'HUB_JP_NAGAR', lat: 12.9063, lon: 77.5857 }
        ].map(hub => {
          const isSelected = currentRegionName.toLowerCase().includes(hub.name.toLowerCase());
          return (
            <button
              key={hub.id}
              onClick={() => {
                const match = executiveReports?.find(r => r.region_name.toLowerCase().includes(hub.name.toLowerCase()));
                if (match) {
                  onSelectRegion(match);
                } else {
                  onSelectRegion({
                    region_id: hub.id,
                    region_name: `${hub.name} (100ft Corridor)`,
                    rank: 3,
                    suitability_score: 93.0,
                    projected_daily_cups: 1040,
                    projected_monthly_revenue_lakhs: '54.5',
                    white_space_gap: 88,
                    payback_period_months: 14.8,
                    min_dist_to_existing_pb_km: 2.1,
                    coordinates: { lat: hub.lat, lon: hub.lon },
                    catchment_metrics: {
                      walk_5min: { population: 28400, households: 7200, daily_cups_share: '38%' },
                      drive_10min: { population: 89000, households: 23500, daily_cups_share: '44%' },
                      delivery_15min: { population: 178000, households: 46000, daily_cups_share: '18%' }
                    }
                  });
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {hub.name}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGIONAL FOOTFALL DYNAMICS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'regional' && matchedRegionalProfile && (
        <div className="space-y-3">
          {/* Header & Regional Macro Volume */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              <span>REGIONAL TRADE AREA • Dynamics</span>
              <span className="text-amber-600 font-bold font-mono">
                {activeDayType === 'weekend' ? 'Weekend Surge' : 'Weekday Flow'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-sans">
                  {matchedRegionalProfile.region_name}
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  {matchedRegionalProfile.zone} • {matchedRegionalProfile.corridors?.length || 3} Commercial Arteries
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-red-700 block">
                  ~{(matchedRegionalProfile.annual_unique_visitors / 1000000).toFixed(2)}M / yr
                </span>
                <span className="text-[10px] text-slate-400">Annual Footfall</span>
              </div>
            </div>
          </div>

          {/* Key Regional Volume KPIs */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">Weekday Avg:</span>
              <span className="font-bold text-slate-800 text-xs">
                {(matchedRegionalProfile.weekday_daily_footfall / 1000).toFixed(1)}k/d
              </span>
            </div>
            <div className="bg-amber-50/80 p-1.5 rounded border border-amber-200">
              <span className="text-amber-700 block text-[9px]">Weekend Peak:</span>
              <span className="font-bold text-amber-900 text-xs">
                {(matchedRegionalProfile.weekend_daily_footfall / 1000).toFixed(1)}k/d
              </span>
            </div>
            <div className="bg-emerald-50/80 p-1.5 rounded border border-emerald-200">
              <span className="text-emerald-700 block text-[9px]">Avg Dwell:</span>
              <span className="font-bold text-emerald-900 text-xs">
                {matchedRegionalProfile.dwell_time_mins_mean}m
              </span>
            </div>
          </div>

          {/* 24-Hour Diurnal Distribution Curve */}
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 px-0.5">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                24-Hour Regional Visitor Curve
              </span>
              <span className="text-red-700 font-bold">
                {activeHour}:00 → ~{currentVisitorRate.toLocaleString()} visitors/hr
              </span>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyChartData} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regionalFootfallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#94A3B8' }} interval={3} />
                  <YAxis tick={{ fontSize: 7, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '9px', fontFamily: 'monospace' }}
                    formatter={(val) => [`${val.toLocaleString()} visitors/hr`, 'Footfall Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#DC2626" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#regionalFootfallGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Current Active Hour Status Callout */}
            <div className="flex items-center justify-between text-[9px] font-mono bg-white p-1.5 rounded border border-slate-200 mt-1">
              <span className="text-slate-500">Active Hour Status:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                {activeHour >= 19 && activeHour <= 23 && <Flame className="w-3 h-3 text-red-600 inline" />}
                {currentHourlyStat?.activity_phase || 'Standard Flow'}
              </span>
            </div>
          </div>

          {/* Prime Dessert Window Box */}
          <div className="bg-red-50/60 p-2.5 rounded-lg border border-red-200 text-[10px] font-mono space-y-1">
            <div className="flex items-center justify-between font-bold text-red-900">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                Post-Dinner Dessert Window
              </span>
              <span className="bg-red-100 text-red-800 px-1.5 py-0.2 rounded border border-red-300">
                {matchedRegionalProfile.prime_dessert_window?.dessert_window_share_pct}% OF DAILY VOL
              </span>
            </div>
            <p className="text-[9px] text-red-700 leading-relaxed">
              Between <strong>7:00 PM and 11:00 PM</strong>, the {matchedRegionalProfile.region_name.split('(')[0].trim()} corridor 
              absorbs <strong>~{matchedRegionalProfile.prime_dessert_window?.weekend_dessert_window_visitors.toLocaleString()} weekend evening visitors</strong>, 
              forming the prime impulse window for dessert parlors.
            </p>
          </div>

          {/* Regional Corridor Breakdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider block">
              Corridor Footfall Distribution
            </span>
            <div className="space-y-1 font-mono text-[9px]">
              {matchedRegionalProfile.corridors?.map((cor, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">{cor.name}</span>
                    <span className="text-slate-400 text-[8px]">{cor.length_km} km • F&B: {cor.f_and_b_density}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 block">~{cor.daily_footfall.toLocaleString()}/d</span>
                    <span className="text-slate-400 text-[8px]">Daily Traffic</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Footfall Driver Composition */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider block">
              Footfall Generator Composition
            </span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
              <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">F&B & Dining:</span>
                <span className="font-bold text-red-700 text-xs">
                  {matchedRegionalProfile.footfall_driver_composition.f_and_b_dining}%
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Metro Transit:</span>
                <span className="font-bold text-blue-700 text-xs">
                  {matchedRegionalProfile.footfall_driver_composition.metro_transit}%
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Retail & Boutiques:</span>
                <span className="font-bold text-purple-700 text-xs">
                  {matchedRegionalProfile.footfall_driver_composition.retail_shopping}%
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Tech Workplaces:</span>
                <span className="font-bold text-emerald-700 text-xs">
                  {matchedRegionalProfile.footfall_driver_composition.office_commercial}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SITE EXPANSION SUITABILITY (Model 2 Dossier)                       */}
      {/* ========================================================================= */}
      {activeTab === 'suitability' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              <span>SITE SUITABILITY • Demand Kinematics</span>
              <span className="text-emerald-600 font-bold">Rank #{current.rank || 1}</span>
            </div>

            {/* Big KPI readout */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {current.suitability_score}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold">/ 100</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-0.5 truncate max-w-[220px]">
                  {current.region_name}
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-amber-600 block">
                  {current.projected_daily_cups?.toLocaleString()} cups/d
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ₹{current.projected_monthly_revenue_lakhs}L / mo
                </span>
              </div>
            </div>

            {/* Line Chart: 12-Month Projected Growth */}
            <div className="h-24 w-full bg-slate-50 rounded-lg p-1.5 border border-slate-200">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 px-1 mb-0.5">
                <span>Projected Cup Trajectory (12-Mo)</span>
                <span className="text-amber-600 font-bold">Peak: 1,180 cups/d</span>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={demandTrajectory} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cupGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 8, fill: '#94A3B8' }} domain={[500, 1300]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '10px', fontFamily: 'monospace' }} 
                  />
                  <Area type="monotone" dataKey="cups" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#cupGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-Metric Rows */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">White-Space Gap:</span>
                <span className="font-bold text-emerald-600 text-xs">{current.white_space_gap} / 100</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Franchise Payback:</span>
                <span className="font-bold text-slate-800 text-xs">{current.payback_period_months} months</span>
              </div>
            </div>
          </div>

          {/* Cannibalization Shield & Catchment */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              <span>Cannibalization Shield</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                100% Shield
              </span>
            </div>

            <div className="flex items-center justify-between bg-emerald-50/80 p-2 rounded border border-emerald-200">
              <div>
                <span className="text-[10px] font-mono text-emerald-800 font-semibold block">
                  Nearest Polar Bear Store:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900">
                  {current.min_dist_to_existing_pb_km} km away
                </span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                SAFE BUFFER
              </span>
            </div>

            {/* Isochrone breakdown table */}
            {current.catchment_metrics && (
              <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-[9px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-500">
                    <tr>
                      <th className="p-1.5">Catchment</th>
                      <th className="p-1.5 text-right">Pop</th>
                      <th className="p-1.5 text-right">Households</th>
                      <th className="p-1.5 text-right">Cup Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-1.5 text-emerald-700 font-semibold">5m Walk</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.walk_5min.population.toLocaleString()}</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.walk_5min.households.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-amber-600 font-bold">{current.catchment_metrics.walk_5min.daily_cups_share}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-blue-700 font-semibold">10m Drive</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.drive_10min.population.toLocaleString()}</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.drive_10min.households.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-amber-600 font-bold">{current.catchment_metrics.drive_10min.daily_cups_share}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-purple-700 font-semibold">15m Delivery</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.delivery_15min.population.toLocaleString()}</td>
                      <td className="p-1.5 text-right">{current.catchment_metrics.delivery_15min.households.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-amber-600 font-bold">{current.catchment_metrics.delivery_15min.daily_cups_share}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
