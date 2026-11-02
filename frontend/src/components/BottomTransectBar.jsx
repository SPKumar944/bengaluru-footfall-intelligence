import React from 'react';
import { Play, Pause, BarChart2, Clock, Calendar, Zap, Flame } from 'lucide-react';

export default function BottomTransectBar({
  executiveReports,
  selectedRegion,
  onSelectRegion,
  activeHour = 21,
  setActiveHour,
  activeDayType = 'weekend',
  setActiveDayType,
  isPlayingHour = false,
  setIsPlayingHour,
  regionalFootfallMatrix = []
}) {
  // Transect profile across 18 commercial micro-markets
  const transectData = [
    { name: 'Kengeri', val: 32, rank: 10, region_id: 'HUB_KENGERI', lat: 12.9176, lon: 77.4837 },
    { name: 'Banashankari', val: 48, rank: 9, region_id: 'HUB_BANASHANKARI', lat: 12.9255, lon: 77.5468 },
    { name: 'Basavanagudi', val: 56, rank: 8, region_id: 'HUB_BASAVANAGUDI', lat: 12.9416, lon: 77.5753 },
    { name: 'Jayanagar', val: 68, rank: 7, region_id: 'HUB_JAYANAGAR', lat: 12.9299, lon: 77.5824 },
    { name: 'JP Nagar', val: 84, rank: 4, region_id: 'HUB_JP_NAGAR', lat: 12.9063, lon: 77.5857 },
    { name: 'BTM Layout', val: 62, rank: 6, region_id: 'HUB_BTM_LAYOUT', lat: 12.9166, lon: 77.6101 },
    { name: 'Koramangala', val: 88, rank: 5, region_id: 'HUB_KORAMANGALA', lat: 12.9352, lon: 77.6245 },
    { name: 'HSR Layout', val: 92, rank: 3, region_id: 'HUB_HSR_LAYOUT', lat: 12.9121, lon: 77.6446 },
    { name: 'Bellandur', val: 95, rank: 2, region_id: 'HUB_BELLANDUR', lat: 12.9260, lon: 77.6762 },
    { name: 'Indiranagar', val: 93, rank: 3, region_id: 'HUB_INDIRANAGAR', lat: 12.9719, lon: 77.6412 },
    { name: 'MG Road', val: 78, rank: 6, region_id: 'HUB_MG_ROAD', lat: 12.9756, lon: 77.6097 },
    { name: 'Frazer Town', val: 58, rank: 7, region_id: 'HUB_FRAZER_TOWN', lat: 12.9968, lon: 77.6131 },
    { name: 'Malleshwaram', val: 74, rank: 5, region_id: 'HUB_MALLESHWARAM', lat: 13.0031, lon: 77.5643 },
    { name: 'Rajajinagar', val: 65, rank: 6, region_id: 'HUB_RAJAJINAGAR', lat: 12.9982, lon: 77.5530 },
    { name: 'Hebbal', val: 72, rank: 5, region_id: 'HUB_HEBBAL', lat: 13.0358, lon: 77.5970 },
    { name: 'Kammanahalli', val: 66, rank: 6, region_id: 'HUB_KAMMANAHALLI', lat: 13.0093, lon: 77.6377 },
    { name: 'Kalyan Nagar', val: 70, rank: 5, region_id: 'HUB_KALYAN_NAGAR', lat: 13.0221, lon: 77.6403 },
    { name: 'Whitefield', val: 98, rank: 1, region_id: 'HUB_WHITEFIELD', lat: 12.9698, lon: 77.7499 }
  ];

  // Lookup active region profile from regional matrix
  const currentRegionName = selectedRegion?.region_name || 'Indiranagar (100ft & 12th Main)';
  const matchedMatrix = regionalFootfallMatrix.find(r => 
    currentRegionName.toLowerCase().includes(r.region_name.toLowerCase()) ||
    r.region_name.toLowerCase().includes(currentRegionName.toLowerCase()) ||
    (currentRegionName.toLowerCase().includes('indiranagar') && r.region_id === 'HUB_INDIRANAGAR')
  ) || regionalFootfallMatrix[0];

  const currentHourlyPoint = matchedMatrix?.hourly_dynamics?.find(h => h.hour_num === activeHour);
  const liveHourlyVisitors = activeDayType === 'weekend' 
    ? (currentHourlyPoint?.weekend_visitors || 8540)
    : (currentHourlyPoint?.weekday_visitors || 4100);

  const isPeakDessert = activeHour >= 19 && activeHour <= 23;

  return (
    <div className="observatory-card rounded-t-xl border-b-0 border-x-0 border-t border-[#DCE3EC] px-5 py-2.5 flex flex-col space-y-2.5 select-none shadow-xl bg-white/95 backdrop-blur">
      {/* Top Row: Transect Title & Bar Histogram */}
      <div className="flex items-center justify-between">
        <div className="shrink-0 mr-4">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
            <span>B / ZONAL TRANSECT PROFILE • Spatial Footfall Across 18 Micro-Markets</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
            West-to-East commercial corridor transect (Click any node to fly & inspect)
          </p>
        </div>

        {/* Bar Histogram Visualization */}
        <div className="flex items-end space-x-1.5 h-9 grow max-w-2xl px-3 py-1 bg-slate-50 rounded border border-slate-200">
          {transectData.map((d, i) => {
            const isHotspot = d.rank <= 5;
            const isCurrent = currentRegionName.toLowerCase().includes(d.name.toLowerCase());
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onClick={() => {
                  const match = executiveReports?.find(r => r.region_name.toLowerCase().includes(d.name.toLowerCase()));
                  if (match) {
                    onSelectRegion(match);
                  } else {
                    // Custom fallback region object for Indiranagar or other nodes
                    onSelectRegion({
                      region_id: d.region_id,
                      region_name: `${d.name} (Commercial Hub)`,
                      rank: d.rank,
                      suitability_score: d.val,
                      projected_daily_cups: Math.round(d.val * 11.2),
                      projected_monthly_revenue_lakhs: (d.val * 0.58).toFixed(1),
                      white_space_gap: Math.round(d.val * 0.95),
                      payback_period_months: 14.5,
                      min_dist_to_existing_pb_km: 2.1,
                      coordinates: { lat: d.lat, lon: d.lon },
                      catchment_metrics: {
                        walk_5min: { population: 28400, households: 7200, daily_cups_share: '38%' },
                        drive_10min: { population: 89000, households: 23500, daily_cups_share: '44%' },
                        delivery_15min: { population: 178000, households: 46000, daily_cups_share: '18%' }
                      }
                    });
                  }
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-30">
                  {d.name}: {d.val} pts
                </div>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isCurrent
                      ? 'bg-red-600 ring-2 ring-red-400'
                      : isHotspot
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  style={{ height: `${d.val}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Selected Hub Dynamic Footfall Stat Badge */}
        <div className="shrink-0 ml-4 font-mono text-right bg-slate-100 px-3 py-1 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
            {matchedMatrix?.region_name.split('(')[0].trim() || 'Selected Hub'} • Live Flow
          </span>
          <span className="text-xs font-bold text-red-700 block">
            ~{liveHourlyVisitors.toLocaleString()} visitors/hr
          </span>
        </div>
      </div>

      {/* Bottom Timeline Horizon & Dynamic 24-Hour Scrubber */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-200 gap-4">
        {/* Play/Pause & Time Indicator */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setIsPlayingHour && setIsPlayingHour(!isPlayingHour)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors shadow-sm ${
              isPlayingHour
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title={isPlayingHour ? 'Pause Temporal Flow' : 'Play 24-Hour Diurnal Flow'}
          >
            {isPlayingHour ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-900 font-extrabold text-xs">
              {activeHour.toString().padStart(2, '0')}:00
            </span>
            <span className="text-slate-400">
              ({activeHour < 12 ? `${activeHour} AM` : activeHour === 12 ? '12 PM' : `${activeHour - 12} PM`})
            </span>
          </div>

          {/* Phase Tag */}
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tight inline-flex items-center gap-1 border ${
            isPeakDessert
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {isPeakDessert && <Flame className="w-2.5 h-2.5 text-red-600 inline" />}
            {isPeakDessert ? 'PRIME DESSERT WINDOW (41% VOL)' : currentHourlyPoint?.activity_phase || 'Standard Flow'}
          </span>
        </div>

        {/* Dynamic 24-Hour Slider */}
        <div className="grow max-w-xl flex items-center space-x-2 px-2">
          <span className="text-[9px] text-slate-400">00:00</span>
          <input
            type="range"
            min="0"
            max="23"
            value={activeHour}
            onChange={(e) => setActiveHour && setActiveHour(parseInt(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <span className="text-[9px] text-slate-400">23:00</span>
        </div>

        {/* Day Type Toggle (Weekday vs Weekend Surge) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[9px] font-mono shrink-0">
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekday')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeDayType === 'weekday'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekday
          </button>
          <button
            onClick={() => setActiveDayType && setActiveDayType('weekend')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeDayType === 'weekend'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekend (+73% Surge)
          </button>
        </div>

        {/* CRS Projection tag */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[9px] text-slate-400 shrink-0">
          <span>BBMP URBAN</span>
          <span>•</span>
          <span className="font-semibold text-slate-600">EPSG:32643 UTM 43N</span>
        </div>
      </div>
    </div>
  );
}
