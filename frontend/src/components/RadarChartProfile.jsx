import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function RadarChartProfile({ profile }) {
  if (!profile) return null;

  const data = [
    { subject: 'Footfall Synergy', site: profile.footfall_synergy, benchmark: 75 },
    { subject: 'Catchment Pop', site: profile.demographics, benchmark: 80 },
    { subject: 'Transit / Metro', site: profile.transit_accessibility, benchmark: 65 },
    { subject: 'Dining Density', site: profile.dining_density, benchmark: 70 },
    { subject: 'White-Space Yield', site: profile.white_space_yield, benchmark: 60 }
  ];

  return (
    <div className="w-full h-48 bg-[#0E131E]/80 rounded-lg p-2 border border-[#222938]">
      <div className="flex justify-between items-center px-2 mb-1">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          Site Performance vs BLR P90 Benchmark
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Site
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> P90
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#222938" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="BLR P90"
            dataKey="benchmark"
            stroke="#475569"
            fill="#475569"
            fillOpacity={0.2}
          />
          <Radar
            name="Candidate Site"
            dataKey="site"
            stroke="#06B6D4"
            fill="#06B6D4"
            fillOpacity={0.45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              fontSize: '11px',
              fontFamily: 'monospace',
              borderRadius: '6px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
