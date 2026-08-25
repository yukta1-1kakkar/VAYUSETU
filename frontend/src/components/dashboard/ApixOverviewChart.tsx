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
import { TrendingUp, Calendar, Info } from 'lucide-react';

export const ApixOverviewChart: React.FC<{
  showFullDetails?: boolean;
}> = ({ showFullDetails = false }) => {
  const [filter, setFilter] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');

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

  const currentVal = INDEX_TIMELINE[INDEX_TIMELINE.length - 1].indexValue;
  const prevVal = INDEX_TIMELINE[INDEX_TIMELINE.length - 2].indexValue;
  const momChange = ((currentVal - prevVal) / prevVal * 100).toFixed(2);

  return (
    <div className="intel-card p-6 w-full space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1769AA] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
            <span>APIx — AIRFARE PRICE INDEX</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black font-heading text-[#172033]">
              {currentVal}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-[#DC2626] border border-rose-100">
              <TrendingUp className="w-3 h-3" />
              +{momChange}% MoM
            </span>
            <span className="text-xs text-[#64748B] hidden md:inline">
              Base 100.0 (Jan 2025)
            </span>
          </div>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === t
                  ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-[#EDF2F7]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 sm:h-84 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="apixGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1769AA" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#1769AA" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="apixConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F8B8D" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#0F8B8D" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[95, 'auto']}
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[170px]">
                      <div className="font-semibold text-[#172033] border-b border-[#F1F5F9] pb-1">
                        {label}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">APIx Value:</span>
                        <span className="font-bold text-[#1769AA] text-sm">{data.indexValue}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Monthly Δ:</span>
                        <span className={`font-semibold ${data.monthlyChange >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {data.monthlyChange >= 0 ? `+${data.monthlyChange}%` : `${data.monthlyChange}%`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#94A3B8] pt-1">
                        <span>Confidence:</span>
                        <span>{data.lowerConfidence} – {data.upperConfidence}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={100} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Base 100', fill: '#94A3B8', fontSize: 10, position: 'insideBottomRight' }} />
            <Area type="monotone" dataKey="upperConfidence" stroke="none" fill="url(#apixConfidence)" name="95% CI" />
            <Area type="monotone" dataKey="indexValue" stroke="#1769AA" strokeWidth={2.5} fill="url(#apixGradient)" name="APIx" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#1769AA] rounded-full" />
            <span className="font-medium text-[#172033]">APIx Primary Index</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-teal-100 border border-teal-300 rounded-sm" />
            <span>95% Confidence Interval</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#64748B] text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Calculated across 24 weighted trunk and regional city pairs</span>
        </div>
      </div>
    </div>
  );
};
