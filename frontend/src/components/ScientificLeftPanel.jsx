import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  Users, 
  Clock, 
  Flame, 
  MapPin, 
  TrendingUp, 
  Footprints,
  Compass
} from 'lucide-react';

export default function ScientificLeftPanel({
  selectedRegion,
  onSelectRegion,
  activeHour = 21,
  activeDayType = 'weekend',
  regionalFootfallMatrix = []
}) {
  const currentRegionName = selectedRegion?.region_name || 'Indiranagar (100ft & 12th Main)';

  // Lookup regional profile from matrix
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

  const isPeakDessert = activeHour >= 19 && activeHour <= 23;

  if (!matchedRegionalProfile) return null;

  return (
    <div className="w-[380px] observatory-card rounded-xl p-4 flex flex-col space-y-3.5 max-h-[calc(100vh-10.5rem)] overflow-y-auto text-xs font-sans text-slate-700 bg-white/95 backdrop-blur shadow-2xl border border-[#DCE3EC]">
      {/* 1. Header & Regional Macro Volume */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          <span className="flex items-center gap-1 font-bold text-red-700">
            <Footprints className="w-3.5 h-3.5 inline text-red-600" />
            REGIONAL FOOTFALL DYNAMICS
          </span>
          <span className="text-amber-600 font-bold font-mono">
            {activeDayType === 'weekend' ? 'Weekend Surge' : 'Weekday Flow'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1.5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
              {matchedRegionalProfile.region_name}
            </h3>
            <p className="text-[10px] font-mono text-slate-500">
              {matchedRegionalProfile.zone} • {matchedRegionalProfile.corridors?.length || 3} Key Arteries
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-sm font-extrabold text-red-700 block">
              ~{(matchedRegionalProfile.annual_unique_visitors / 1000000).toFixed(2)}M / yr
            </span>
            <span className="text-[9px] text-slate-400 uppercase">Annual Footfall</span>
          </div>
        </div>
      </div>

      {/* 2. Key Regional Volume KPIs */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span className="text-slate-400 block text-[9px] uppercase">Weekday Avg:</span>
          <span className="font-extrabold text-slate-800 text-xs">
            {(matchedRegionalProfile.weekday_daily_footfall / 1000).toFixed(1)}k / day
          </span>
        </div>
        <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200">
          <span className="text-amber-700 block text-[9px] uppercase font-semibold">Weekend Peak:</span>
          <span className="font-extrabold text-amber-900 text-xs">
            {(matchedRegionalProfile.weekend_daily_footfall / 1000).toFixed(1)}k / day
          </span>
        </div>
        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
          <span className="text-emerald-700 block text-[9px] uppercase font-semibold">Avg Dwell:</span>
          <span className="font-extrabold text-emerald-900 text-xs">
            {matchedRegionalProfile.dwell_time_mins_mean} mins
          </span>
        </div>
      </div>

      {/* 3. 24-Hour Diurnal Distribution Curve */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-0.5">
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            24-Hour Regional Visitor Flow
          </span>
          <span className="text-red-700 font-extrabold font-mono">
            {activeHour}:00 → ~{currentVisitorRate.toLocaleString()} visitors/hr
          </span>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyChartData} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
              <defs>
                <linearGradient id="regionalFootfallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 7.5, fill: '#64748B' }} interval={3} />
              <YAxis tick={{ fontSize: 7.5, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '9px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val.toLocaleString()} visitors/hr`, 'Footfall Rate']}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="#DC2626" 
                strokeWidth={2.2} 
                fillOpacity={1} 
                fill="url(#regionalFootfallGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live Active Scrubber Indicator */}
        <div className="flex items-center justify-between text-[9px] font-mono bg-white p-2 rounded border border-slate-200">
          <span className="text-slate-500 font-semibold">Active Scrubber Window:</span>
          <span className="font-extrabold text-slate-900 flex items-center gap-1">
            {isPeakDessert && <Flame className="w-3.5 h-3.5 text-red-600 inline" />}
            {currentHourlyStat?.activity_phase || 'Standard Flow'}
          </span>
        </div>
      </div>

      {/* 4. Prime Evening Dessert Peak Callout */}
      <div className="bg-red-50/70 p-3 rounded-lg border border-red-200 text-[10px] font-mono space-y-1">
        <div className="flex items-center justify-between font-bold text-red-900">
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            Prime Evening Dessert Peak (7 - 11 PM)
          </span>
          <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-300 font-extrabold text-[9px]">
            {matchedRegionalProfile.prime_dessert_window?.dessert_window_share_pct}% OF DAILY VOL
          </span>
        </div>
        <p className="text-[9.5px] text-red-800 leading-relaxed pt-0.5">
          Between <strong>7:00 PM and 11:00 PM</strong>, the {matchedRegionalProfile.region_name.split('(')[0].trim()} corridor 
          absorbs <strong>~{matchedRegionalProfile.prime_dessert_window?.weekend_dessert_window_visitors.toLocaleString()} weekend evening visitors</strong>, 
          representing over 40% of the entire day's impulse retail and dining footfall.
        </p>
      </div>

      {/* 5. Micro-Corridor Footfall Breakdown */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
          Corridor Artery Breakdown
        </span>
        <div className="space-y-1.5 font-mono text-[9px]">
          {matchedRegionalProfile.corridors?.map((cor, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block text-[10px]">{cor.name}</span>
                <span className="text-slate-400 text-[8.5px]">{cor.length_km} km • F&B Intensity: {cor.f_and_b_density}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-amber-700 block text-xs">~{cor.daily_footfall.toLocaleString()}/d</span>
                <span className="text-slate-400 text-[8px] uppercase">Daily Footfall</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Regional Footfall Driver Breakdown */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
          Footfall Generator Composition
        </span>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[8.5px]">F&B & Dining:</span>
            <span className="font-extrabold text-red-700 text-xs">
              {matchedRegionalProfile.footfall_driver_composition.f_and_b_dining}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[8.5px]">Namma Metro Transit:</span>
            <span className="font-extrabold text-blue-700 text-xs">
              {matchedRegionalProfile.footfall_driver_composition.metro_transit}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[8.5px]">Retail & Boutiques:</span>
            <span className="font-extrabold text-purple-700 text-xs">
              {matchedRegionalProfile.footfall_driver_composition.retail_shopping}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[8.5px]">Startups & Tech Offices:</span>
            <span className="font-extrabold text-emerald-700 text-xs">
              {matchedRegionalProfile.footfall_driver_composition.office_commercial}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
