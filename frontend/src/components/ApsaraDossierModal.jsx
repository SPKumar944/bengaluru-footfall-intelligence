import React from 'react';
import { X, MapPin, Star, Footprints, Flame, ExternalLink } from 'lucide-react';

export default function ApsaraDossierModal({
  apsaraStores = [],
  selectedApsaraStore,
  onSelectApsaraStore,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none">
      <div className="observatory-card bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h2 className="font-sans text-base font-extrabold text-slate-900">
                Apsara Ice Cream — Bengaluru Store Register (13 Locations)
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Verified Google Places Metadata • Store-Level Footfall & Regional Corridor Traffic
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="p-4 overflow-y-auto grow">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Serial</th>
                <th className="p-2.5">Locality / Corridor</th>
                <th className="p-2.5">Rating & Reviews</th>
                <th className="p-2.5 text-right">Est. Daily Cups</th>
                <th className="p-2.5 text-right">Regional Weekend Flow</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {apsaraStores.map((s) => {
                const isSelected = selectedApsaraStore?.serial_no === s.serial_no;
                return (
                  <tr
                    key={s.serial_no}
                    className={`hover:bg-amber-50/50 transition-colors ${
                      isSelected ? 'bg-amber-50 font-semibold' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] border border-slate-200">
                        {s.serial_no}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{s.locality}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[280px]">
                        {s.address}
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{s.google_rating}★</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          ({s.google_review_count.toLocaleString()} rev)
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <span className="text-red-700 font-bold block text-xs">
                        ~{s.store_footfall.est_daily_cups} cups/d
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        ~{s.store_footfall.est_monthly_customers.toLocaleString()}/mo
                      </span>
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-800 block text-xs">
                        ~{s.regional_footfall.weekend_daily_footfall.toLocaleString()}/d
                      </span>
                      <span className="text-[9px] text-amber-700 font-semibold block">
                        🔥 ~{s.regional_footfall.peak_evening_hourly_flow.toLocaleString()}/hr (7-11 PM)
                      </span>
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectApsaraStore(s);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all flex items-center gap-1 mx-auto shadow-xs"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Fly To</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>13 Active Outlets in Bengaluru Urban</span>
          <span className="text-red-700 font-semibold">Total Tracked Reviews: 6,857 | Network Volume: ~730 cups/day</span>
        </div>
      </div>
    </div>
  );
}
