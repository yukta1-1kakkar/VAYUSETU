import React, { useState } from 'react';
import { CPI_DATA_SERIES } from '../../mock/airfareData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, HelpCircle, ArrowRightLeft } from 'lucide-react';

export const CpiComparisonChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y' | 'ALL'>('1Y');

  const filteredData = React.useMemo(() => {
    switch (timeframe) {
      case '1Y':
        return CPI_DATA_SERIES.slice(-6);
      case '3Y':
        return CPI_DATA_SERIES.slice(-10);
      case '5Y':
      case 'ALL':
      default:
        return CPI_DATA_SERIES;
    }
  }, [timeframe]);

  return (
    <div className="intel-card p-6 sm:p-8 w-full space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F8B8D] uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MACROECONOMIC TRANSMISSION LAB</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#172033]">
            APIx Airfare Index vs Official CPI Inflation
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Empirical comparison of high-velocity aviation prices against the official MoSPI Consumer Price Index.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
          {(['1Y', '3Y', '5Y', 'ALL'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-[#0F8B8D] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards for Macro Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">APIx Index Value</div>
          <div className="text-2xl font-extrabold text-[#1769AA] mt-1">108.4</div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-0.5">+8.4% Cumulative</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">CPI General (MoSPI)</div>
          <div className="text-2xl font-extrabold text-[#0F8B8D] mt-1">129.2</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Base 100 benchmark (2012)</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">CPI Transport Component</div>
          <div className="text-2xl font-extrabold text-[#6366F1] mt-1">122.6</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Direct mobility basket</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">Observed Correlation</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">+0.74 r</div>
          <div className="text-[11px] text-[#0F8B8D] font-semibold mt-0.5">Statistically Significant</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[95, 135]}
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[210px]">
                      <div className="font-semibold text-[#172033] border-b border-[#F1F5F9] pb-1">
                        Month: {label}
                      </div>
                      <div className="flex justify-between items-center text-[#1769AA]">
                        <span>APIx Airfare Index:</span>
                        <span className="font-bold">{payload[0]?.value}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#0F8B8D]">
                        <span>CPI General (Headline):</span>
                        <span className="font-bold">{payload[1]?.value}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#6366F1]">
                        <span>CPI Transport:</span>
                        <span className="font-bold">{payload[2]?.value}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="airfareIndex"
              name="APIx Airfare Index"
              stroke="#1769AA"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1769AA', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cpiGeneral"
              name="CPI General (Official Basket)"
              stroke="#0F8B8D"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: '#0F8B8D' }}
            />
            <Line
              type="monotone"
              dataKey="cpiTransport"
              name="CPI Transport & Comm."
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366F1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mandatory Analytical Notice (Prompt section 11 requirement) */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-[#172033]">
        <HelpCircle className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#1769AA]">Analytical Correlation Note: </span>
          The correlation coefficient (+0.74) is provided for macroeconomic trend benchmarking only. 
          Airfare movements reflect immediate supply-demand shifts and dynamic revenue algorithms, whereas official CPI tracks a broader fixed consumer expenditure basket. Correlation is measured for analytical comparison and does not imply direct causation.
        </div>
      </div>
    </div>
  );
};
