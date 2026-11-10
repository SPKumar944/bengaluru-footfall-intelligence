import React from 'react';
import { X, MapPin, Star, Footprints, ExternalLink } from 'lucide-react';
import { 
  formatStoreCupVolumeRange, 
  formatStoreMonthlyCustomersRange, 
  formatCatchmentDailyRange, 
  formatHourlyFootfallRange,
  getFootfallTier
} from '../utils/footfallFormatters';

export default function ApsaraDossierModal({
  apsaraStores = [],
  selectedApsaraStore,
  onSelectApsaraStore,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-xs p-4 select-none">
      <div className="observatory-card bg-white rounded-2xl shadow-2xl border border-ink-950/[0.12] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* AGT Signature Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-azure-600 via-azure-500 to-violet-500" />

        {/* Header */}
        <div className="p-4 px-6 border-b border-ink-950/[0.08] flex items-center justify-between bg-paper-50">
          <div className="flex items-center gap-3">
            <img 
              src="./brand/agt-mark-ink.png" 
              alt="AGT Intelligence" 
              className="h-6 w-auto object-contain" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-azure-500/30 bg-azure-500/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-azure-700 font-bold">
                  AGT · Client Dossier
                </span>
                <h2 className="font-sans text-base font-extrabold text-ink-950">
                  Apsara Ice Cream — Bengaluru Store Register ({apsaraStores.length} Outlets)
                </h2>
              </div>
              <p className="text-xs font-mono text-ink-500 mt-0.5">
                Standardised Location Intelligence • Store-Level Footfall & Regional Corridor Traffic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-paper-100 text-ink-400 hover:text-ink-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="p-4 overflow-y-auto grow">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-paper-100 text-ink-600 border-b border-ink-950/[0.08] uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Serial</th>
                <th className="p-2.5">Locality / Corridor</th>
                <th className="p-2.5">Rating & Reviews</th>
                <th className="p-2.5 text-right">Est. Daily Cups</th>
                <th className="p-2.5 text-right">Regional Weekend Flow</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/[0.06] text-ink-700">
              {apsaraStores.map((s) => {
                const isSelected = selectedApsaraStore?.serial_no === s.serial_no;
                return (
                  <tr
                    key={s.serial_no}
                    className={`hover:bg-azure-50/50 transition-colors ${
                      isSelected ? 'bg-azure-50 font-semibold' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-ink-950 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-paper-100 text-ink-800 text-[10px] border border-ink-950/[0.1]">
                        {s.serial_no}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-ink-950">{s.locality}</div>
                      <div className="text-[10px] text-ink-400 truncate max-w-[280px]">
                        {s.address}
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-ink-950 font-bold">
                        <Star className="w-3.5 h-3.5 fill-azure-500 text-azure-600" />
                        <span>{s.google_rating}</span>
                        <span className="text-ink-400 font-normal text-[10px]">
                          ({s.google_review_count.toLocaleString()} reviews)
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <span className="text-azure-700 font-bold block text-xs font-mono">
                        {formatStoreCupVolumeRange(s.store_footfall?.est_daily_cups)}
                      </span>
                      <span className="text-[9px] text-ink-400 block font-mono">
                        {formatStoreMonthlyCustomersRange(s.store_footfall?.est_monthly_customers)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      {(() => {
                        const regionalTier = getFootfallTier(s.regional_footfall?.peak_evening_hourly_flow);
                        return (
                          <>
                            <span className="font-bold text-ink-900 block text-xs font-mono">
                              {formatCatchmentDailyRange(s.regional_footfall?.weekend_daily_footfall)}
                            </span>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span 
                                className="text-[8.5px] px-1 py-0.2 rounded font-mono font-black"
                                style={{ 
                                  backgroundColor: regionalTier.hex,
                                  color: regionalTier.textColor || '#ffffff'
                                }}
                              >
                                Index {regionalTier.displayLevel || regionalTier.level}
                              </span>
                              <span className="text-[9px] text-ink-600 font-semibold font-mono">
                                {regionalTier.rangeLabel}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectApsaraStore(s);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-ink-950 hover:bg-ink-800 text-white text-[10px] font-semibold transition-all flex items-center gap-1 mx-auto shadow-xs"
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
        <div className="p-3 px-6 bg-paper-50 border-t border-ink-950/[0.08] flex items-center justify-between text-xs font-mono text-ink-500">
          <span>{apsaraStores.length} Verified Outlets in Bengaluru Urban</span>
          <span className="text-azure-700 font-semibold">
            Total Tracked Reviews: {apsaraStores.reduce((acc, s) => acc + (s.google_review_count || 0), 0).toLocaleString()} | Network Volume: ~{apsaraStores.reduce((acc, s) => acc + (s.store_footfall?.est_daily_cups || 0), 0).toLocaleString()} cups/day
          </span>
        </div>
      </div>
    </div>
  );
}
