import React, { useState } from 'react';
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
import {
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Database,
  Radio,
  FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const Part1_HeroSovereignIndex: React.FC<{
  onJumpToMatrix: () => void;
  onExploreRoutes: () => void;
}> = ({ onJumpToMatrix, onExploreRoutes }) => {
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y');

  const filteredData =
    timeframe === '1M'
      ? INDEX_TIMELINE.slice(-4)
      : timeframe === '6M'
      ? INDEX_TIMELINE.slice(-7)
      : timeframe === '1Y'
      ? INDEX_TIMELINE.slice(-12)
      : INDEX_TIMELINE;

  return (
    <section id="part1-index" className="space-y-8 pt-4">
      {/* Top Banner & Sovereign Title */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">
              PART 01 // SOVEREIGN AIRFARE INDEX & TELEMETRY HUB
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-space text-white tracking-tight">
            Understanding the Movement of Airfares in India
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            India’s first weighted sovereign aviation price index. Tracking real-time yield velocity,
            trunk corridor capacity, and macroeconomic inflation divergence across 24,800+ daily scrapes.
          </p>
        </div>

        {/* Quick Jump Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onJumpToMatrix();
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>OPEN 3D & 2D MATRIX</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onExploreRoutes();
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>EXPLORE ROUTES</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Index Value */}
        <div className="tech-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              VAYUSETU INDEX (LIVE)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              AUG 2026
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono mt-1">
            <span className="text-4xl sm:text-5xl font-bold font-space text-white">113.6</span>
            <span className="text-xs text-slate-400 font-medium">BASE 100</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+13.6% cumulative shift since Jan 2025</span>
          </div>
        </div>

        {/* Metric 2: Monthly Movement */}
        <div className="tech-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              MONTHLY VELOCITY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              MOM
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono mt-1">
            <span className="text-4xl sm:text-5xl font-bold font-space text-rose-400">+4.82%</span>
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Driven by pre-festival trunk capacity tightening
          </div>
        </div>

        {/* Metric 3: Observation Volume */}
        <div className="tech-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              ACTIVE QUOTE VOLUME
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              24H
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono mt-1">
            <span className="text-4xl sm:text-5xl font-bold font-space text-sky-300">24,850</span>
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Multi-carrier GDS & OTA real-time quotes
          </div>
        </div>

        {/* Metric 4: Data Quality Confidence */}
        <div className="tech-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              HARMONIC TRUST SCORE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              VERIFIED
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono mt-1">
            <span className="text-4xl sm:text-5xl font-bold font-space text-emerald-400">91%</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400 ml-1" />
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            DGCA & MoSPI regulatory alignment
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="tech-panel p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-200">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>SOVEREIGN TIMELINE // HISTORICAL INDEX & VOLATILITY CONFIDENCE BAND</span>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
            {(['1M', '6M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  soundFx.playClick();
                  setTimeframe(tf);
                }}
                className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sovereignIndexGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity="0.4" />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[95, 122]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1422',
                  border: '1px solid rgba(99,102,241,0.35)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                label={{ value: 'BASE 100 (JAN 2025)', fill: '#94A3B8', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="indexValue"
                stroke="#6366F1"
                strokeWidth={2.8}
                fill="url(#sovereignIndexGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
