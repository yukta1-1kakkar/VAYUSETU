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
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

export const ApixOverviewChart: React.FC<{
  showFullDetails?: boolean;
}> = ({ showFullDetails = false }) => {
  // Filters: 3M, 6M, 1Y, FY, ALL (default 3M)
  const [filter, setFilter] = useState<'3M' | '6M' | '1Y' | 'FY' | 'ALL'>('3M');

  const filteredData = React.useMemo(() => {
    switch (filter) {
      case '3M':
        // Last 3 months (06/26, 07/26, 08/26)
        return INDEX_TIMELINE.slice(-3);
      case '6M':
        // Last 6 months (03/26 to 08/26)
        return INDEX_TIMELINE.slice(-6);
      case 'FY':
        // Financial Year (From 01/26 to 08/26)
        return INDEX_TIMELINE.filter(pt => pt.date.includes('/26'));
      case '1Y':
        // 1 Year View (12 months from 08/25 to 08/26)
        return INDEX_TIMELINE.slice(-13);
      case 'ALL':
      default:
        return INDEX_TIMELINE;
    }
  }, [filter]);

  const currentVal = INDEX_TIMELINE[INDEX_TIMELINE.length - 1].indexValue;
  const prevVal = INDEX_TIMELINE[INDEX_TIMELINE.length - 2]?.indexValue ?? currentVal;
  const momChange = Number(((currentVal - prevVal) / prevVal * 100).toFixed(2));

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
              {momChange >= 0 ? '+' : ''}{momChange}% vs previous observation date
            </span>
          </div>
        </div>

        {/* Timeframe Filters: 3M, 6M, 1Y, FY, ALL */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
          {(['3M', '6M', '1Y', 'FY', 'ALL'] as const).map((t) => (
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
              domain={[98, 'auto']}
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
                        Period: {label}
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
                        <span>Quotes Sampled:</span>
                        <span>{data.observations.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="indexValue" stroke="#1769AA" strokeWidth={2.5} fill="url(#apixGradient)" name="APIx" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info with Hoverable Tooltip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#1769AA] rounded-full" />
            <span className="font-medium text-[#172033]">APIx Primary Sovereign Index</span>
          </span>
        </div>

        {/* Hoverable Methodology Tooltip */}
        <div className="relative group/tip cursor-pointer">
          <div className="flex items-center gap-1 text-[#64748B] hover:text-[#1769AA] text-xs font-semibold transition-colors">
            <Info className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>Index Methodology</span>
          </div>

          <div className="absolute bottom-6 right-0 z-50 w-64 p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-xl text-[11px] text-[#172033] leading-relaxed opacity-0 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:pointer-events-auto transition-opacity duration-150">
            <div className="font-bold text-[#1769AA] border-b border-[#F1F5F9] pb-1 mb-1">
              Methodology & Basket
            </div>
            Matched-route price relatives weighted by normalized DGCA passenger traffic across the 24-route basket.
          </div>
        </div>
      </div>
    </div>
  );
};
