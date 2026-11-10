import React from 'react';
import { Store, Calendar } from 'lucide-react';
import { DAYS_OF_WEEK } from '../utils/footfallFormatters';

export default function HeaderBar({
  apsaraStores = [],
  selectedApsaraStore,
  onSelectApsaraStore,
  activeDay = 'saturday',
  onSelectDay
}) {
  return (
    <header className="observatory-header relative z-30 select-none bg-white/95 backdrop-blur-md border-b border-ink-950/[0.08]">
      {/* AGT Signature Top 2px Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-azure-600 via-azure-500 to-violet-500" />

      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Retained Icon and Brand Name */}
        <a 
          href="https://agt-intelligence.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity shrink-0"
          title="AGT Intelligence — Location Intelligence Platform"
        >
          <img 
            src="./brand/agt-mark-ink.png" 
            alt="AGT Intelligence" 
            className="h-7 w-auto object-contain transition duration-200 group-hover:brightness-95" 
          />
          <span className="text-[17px] font-bold tracking-tight text-ink-950 font-sans leading-none">
            AGT<span className="ml-[0.2em] text-[0.93em] font-medium uppercase tracking-[0.06em] text-ink-500">Intelligence</span>
          </span>
        </a>

        {/* Right: Only Store Selection Dropdown & Day Selection Dropdown */}
        <div className="flex items-center space-x-3">
          {/* 1. Store Selection Dropdown */}
          <div className="flex items-center space-x-1.5 bg-paper-50 p-1 px-2 rounded-lg border border-ink-950/[0.1] text-xs font-mono shadow-2xs">
            <Store className="w-3.5 h-3.5 text-azure-600 shrink-0" />
            <span className="text-[10px] text-ink-500 uppercase tracking-wider font-bold hidden sm:inline">Store:</span>
            <select
              value={selectedApsaraStore?.serial_no || ''}
              onChange={(e) => {
                const match = apsaraStores.find(s => s.serial_no === e.target.value);
                if (match) onSelectApsaraStore(match);
              }}
              className="bg-white border border-ink-950/[0.12] rounded px-2 py-1 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer min-w-[170px] sm:min-w-[250px]"
            >
              <option value="">Select Apsara Store (31 Outlets)...</option>
              {apsaraStores.map((s) => (
                <option key={s.serial_no} value={s.serial_no}>
                  #{s.serial_no.split('_')[2]} {s.locality} • {s.zone} (★ {s.google_rating})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Day Selection Dropdown (every weekday and Saturday and Sunday) */}
          <div className="flex items-center space-x-1.5 bg-paper-50 p-1 px-2 rounded-lg border border-ink-950/[0.1] text-xs font-mono shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-azure-600 shrink-0" />
            <span className="text-[10px] text-ink-500 uppercase tracking-wider font-bold hidden sm:inline">Day:</span>
            <select
              value={activeDay}
              onChange={(e) => onSelectDay && onSelectDay(e.target.value)}
              className="bg-white border border-ink-950/[0.12] rounded px-2 py-1 text-xs font-bold text-ink-950 focus:outline-none focus:ring-1 focus:ring-azure-500 cursor-pointer min-w-[150px] sm:min-w-[200px]"
            >
              <optgroup label="Weekdays">
                <option value="monday">Monday (Weekday)</option>
                <option value="tuesday">Tuesday (Weekday)</option>
                <option value="wednesday">Wednesday (Midweek)</option>
                <option value="thursday">Thursday (Pre-Weekend)</option>
                <option value="friday">Friday (Evening Surge)</option>
              </optgroup>
              <optgroup label="Weekend">
                <option value="saturday">Saturday (Weekend Peak)</option>
                <option value="sunday">Sunday (Family Peak)</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
