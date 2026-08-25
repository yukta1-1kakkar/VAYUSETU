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
import { TrendingUp, ShieldCheck, Activity, BarChart2, Zap } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const MarketOverview: React.FC = () => {
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
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-blue-400 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            INDIAN DOMESTIC AVIATION SECTOR // SOVEREIGN METRICS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight mt-1">
            National Airfare Price Index
          </h2>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
          {(['1M', '6M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                soundFx.playClick();
                setTimeframe(tf);
              }}
              className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                timeframe === tf
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Floating 4 Core Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="tech-panel p-5 rounded-xl relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            SOVEREIGN AIRFARE INDEX
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-4xl sm:text-5xl font-bold text-white">113.6</span>
            <span className="text-xs text-slate-500 font-medium">BASE 100</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+13.6% cumulative baseline delta</span>
          </div>
        </div>

        <div className="tech-panel p-5 rounded-xl relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            MOM VELOCITY SHIFT
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-4xl sm:text-5xl font-bold text-rose-400">+4.82%</span>
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Aug 2026 monthly yield acceleration
          </div>
        </div>

        <div className="tech-panel p-5 rounded-xl relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            DAILY SCRAPE SAMPLES
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-4xl sm:text-5xl font-bold text-blue-300">24,850</span>
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Verified GDS & NDC inventory quotes
          </div>
        </div>

        <div className="tech-panel p-5 rounded-xl relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            CROSS-VALIDATION TRUST
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-4xl sm:text-5xl font-bold text-emerald-400">91%</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Weighted harmonic aggregate confidence
          </div>
        </div>
      </div>

      {/* Primary Chart Area */}
      <div className="tech-panel p-6 rounded-xl">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800 font-mono text-xs">
          <span className="text-slate-300 flex items-center gap-2 font-medium">
            <Activity className="w-4 h-4 text-blue-400" />
            VAYUSETU INDEX TIMELINE // UPPER & LOWER VOLATILITY ENVELOPE
          </span>
          <span className="text-slate-500">SYNCHRONIZED: DGCA & MoSPI</span>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="marketIndexGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[95, 122]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'BASE 100', fill: '#94A3B8', fontSize: 10 }} />
              <Area type="monotone" dataKey="indexValue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#marketIndexGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
