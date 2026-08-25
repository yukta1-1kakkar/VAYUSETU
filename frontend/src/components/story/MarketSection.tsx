import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { INDEX_TIMELINE } from '../../mock/airfareData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { soundFx } from '../../utils/sound';

export const MarketSection: React.FC = () => {
  const [selectedStoryTimeframe, setSelectedStoryTimeframe] = useState<'all' | 'recent'>('all');

  const displayedTimeline =
    selectedStoryTimeframe === 'recent' ? INDEX_TIMELINE.slice(-8) : INDEX_TIMELINE;

  return (
    <section id="market" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <SectionHeader
          sectionNumber="04"
          tag="THE MARKET"
          title="Tracking airfare movement across time."
          subtitle="Explore how monsoon off-seasons, Diwali surges, fuel swings, and fleet changes sculpt India’s national airfare trajectory."
        />

        <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedStoryTimeframe('recent');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer ${
              selectedStoryTimeframe === 'recent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            8 MONTHS
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedStoryTimeframe('all');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer ${
              selectedStoryTimeframe === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FULL TIMELINE
          </button>
        </div>
      </div>

      <div className="tech-panel p-6 rounded-2xl">
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayedTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="indexFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4facfe" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#4facfe" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[95, 122]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070D18',
                  border: '1px solid rgba(0,242,254,0.3)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'BASE 100', fill: '#64748b', fontSize: 10 }} />
              <Area type="monotone" dataKey="upperConfidence" stroke="none" fill="url(#confidenceBand)" />
              <Area type="monotone" dataKey="indexValue" stroke="#00f2fe" strokeWidth={3} fill="url(#indexFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800/80 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-cyan-400" /> VAYUSETU INDEX
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-2 bg-blue-500/20 border border-blue-400/40 rounded-sm" /> 95% CONFIDENCE BAND
            </span>
          </div>
          <div className="text-slate-400">
            CURRENT INDEX: <span className="text-cyan-300 font-bold">113.6</span> (RECORD HIGH)
          </div>
        </div>
      </div>
    </section>
  );
};
