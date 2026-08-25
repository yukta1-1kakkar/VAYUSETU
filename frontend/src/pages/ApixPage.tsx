import React, { useState } from 'react';
import { INDEX_TIMELINE, ROUTE_WEIGHTS_DATA, DATA_QUALITY } from '../mock/airfareData';
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
import { TrendingUp, Info, ShieldCheck, Layers, Calendar, ArrowUpRight, CheckCircle2, Cpu } from 'lucide-react';
import { formatDelta } from '../utils/geo';

export const ApixPage: React.FC = () => {
  const [filter, setFilter] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');

  const filteredData = React.useMemo(() => {
    switch (filter) {
      case '1M':
        return INDEX_TIMELINE.slice(-2);
      case '3M':
        return INDEX_TIMELINE.slice(-4);
      case '6M':
        return INDEX_TIMELINE.slice(-7);
      case '1Y':
        return INDEX_TIMELINE.slice(-13);
      case 'ALL':
      default:
        return INDEX_TIMELINE;
    }
  }, [filter]);

  const currentPoint = INDEX_TIMELINE[INDEX_TIMELINE.length - 1];
  const previousPoint = INDEX_TIMELINE[INDEX_TIMELINE.length - 2];
  const momGrowth = ((currentPoint.indexValue - previousPoint.indexValue) / previousPoint.indexValue * 100).toFixed(2);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
            <span>SOVEREIGN BENCHMARK SERIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            APIx — Airfare Price Index
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            India's continuous sovereign aviation price index, weighted by seat-kilometer volume across 24 core trunk and regional corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#1769AA]">
          <ShieldCheck className="w-4 h-4 text-[#1769AA]" />
          <span>DATA CONFIDENCE: {DATA_QUALITY.overallConfidence}%</span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Current APIx Benchmark</div>
          <div className="text-4xl font-extrabold font-heading text-[#172033] mt-1">
            {currentPoint.indexValue}
          </div>
          <div className="text-xs font-bold text-[#DC2626] mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +{momGrowth}% Month-over-Month
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Base Benchmark</div>
          <div className="text-4xl font-extrabold font-heading text-[#172033] mt-1">
            100.0
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            Established Jan 2025 (Fixed Base)
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Daily Tariffs Sampled</div>
          <div className="text-4xl font-extrabold font-heading text-[#1769AA] mt-1">
            {currentPoint.observations.toLocaleString()}
          </div>
          <div className="text-xs text-[#16A34A] font-semibold mt-1">
            5 Verified Airlines Monitored
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Statistical 95% CI</div>
          <div className="text-4xl font-extrabold font-heading text-[#0F8B8D] mt-1">
            ±1.98 pts
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            Range: {currentPoint.lowerConfidence} – {currentPoint.upperConfidence}
          </div>
        </div>
      </div>

      {/* Large Historical APIx Graph */}
      <div className="intel-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-xl font-bold font-heading text-[#172033]">
              APIx Historical Index Trajectory
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Time series from Jan 2025 baseline showing seasonal surges (festive, holidays) and off-season yield adjustments.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === t
                    ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="apixPageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1769AA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1769AA" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="apixPageBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F8B8D" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#0F8B8D" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis domain={[95, 'auto']} stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[180px]">
                        <div className="font-bold text-[#172033] border-b border-[#F1F5F9] pb-1">{label}</div>
                        <div className="flex justify-between items-center text-[#1769AA]">
                          <span>APIx Index:</span>
                          <span className="font-bold text-sm">{data.indexValue}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B]">
                          <span>Monthly Δ:</span>
                          <span className={`font-semibold ${data.monthlyChange >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                            {data.monthlyChange >= 0 ? `+${data.monthlyChange}%` : `${data.monthlyChange}%`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8] pt-1">
                          <span>Observations:</span>
                          <span>{data.observations?.toLocaleString()} quotes</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Base 100 Benchmark', fill: '#94A3B8', fontSize: 11 }} />
              <Area type="monotone" dataKey="upperConfidence" stroke="none" fill="url(#apixPageBand)" name="95% CI" />
              <Area type="monotone" dataKey="indexValue" stroke="#1769AA" strokeWidth={3} fill="url(#apixPageGradient)" name="APIx" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Change Table & Route Basket Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Breakdown Table */}
        <div className="lg:col-span-6 intel-card p-6 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Recent Monthly Performance Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5">Period</th>
                  <th className="py-2.5">APIx Value</th>
                  <th className="py-2.5">MoM Shift</th>
                  <th className="py-2.5">Confidence Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {INDEX_TIMELINE.slice(-8).reverse().map((pt, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 font-bold text-[#172033]">{pt.date}</td>
                    <td className="py-2.5 font-extrabold text-[#1769AA]">{pt.indexValue}</td>
                    <td className="py-2.5 font-semibold">
                      <span className={pt.monthlyChange >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                        {pt.monthlyChange >= 0 ? `+${pt.monthlyChange}%` : `${pt.monthlyChange}%`}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#94A3B8] font-mono">
                      {pt.lowerConfidence} – {pt.upperConfidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route Contribution Breakdown */}
        <div className="lg:col-span-6 intel-card p-6 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Top Corridor Weight & Index Impact
          </h3>
          <div className="space-y-3">
            {ROUTE_WEIGHTS_DATA.slice(0, 6).map((rw) => (
              <div key={rw.routeId} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#172033] text-sm">
                    {rw.originCity} → {rw.destCity} ({rw.routeId})
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {rw.carrierShare}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#1769AA] text-sm">{rw.weight}% Weight</div>
                  <div className="text-[10px] text-[#94A3B8]">{rw.contribution} pts impact</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
