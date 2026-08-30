import React, { useState } from 'react';
import { CPI_COMPARISON_META, CPI_DATA_SERIES } from '../../mock/airfareData';
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
import { BarChart3, HelpCircle } from 'lucide-react';

export const CpiComparisonChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y' | 'ALL'>('1Y');

  const filteredData = React.useMemo(() => {
    switch (timeframe) {
      case '1Y':
        return CPI_DATA_SERIES.slice(-12);
      case '3Y':
        return CPI_DATA_SERIES.slice(-36);
      case '5Y':
      case 'ALL':
      default:
        return CPI_DATA_SERIES;
    }
  }, [timeframe]);

  if (!CPI_DATA_SERIES.length) {
    return <div className="intel-card p-8 text-center"><BarChart3 className="mx-auto h-10 w-10 text-[#0F8B8D]" /><h3 className="mt-3 text-xl font-bold text-[#172033]">APIx comparison awaiting an overlapping month</h3><p className="mt-2 text-sm text-[#64748B]">The official MoSPI CPI graphs and all 19 workbook observations are displayed above. This comparison will activate when monthly APIx and CPI observations overlap.</p></div>;
  }

  const latestAPIx = [...CPI_DATA_SERIES].reverse().find((point) => point.airfareIndex !== null);
  const latestCPI = [...CPI_DATA_SERIES].reverse().find((point) => point.cpiGeneralRaw !== null);
  const matchedData = CPI_DATA_SERIES.filter(
    (point): point is typeof point & { airfareIndex: number; cpiGeneral: number } =>
      point.airfareIndex !== null && point.cpiGeneral !== null,
  );
  const correlation = (() => {
    if (matchedData.length < 2) return null;
    const xs = matchedData.map((point) => point.airfareIndex);
    const ys = matchedData.map((point) => point.cpiGeneral);
    const xMean = xs.reduce((sum, value) => sum + value, 0) / xs.length;
    const yMean = ys.reduce((sum, value) => sum + value, 0) / ys.length;
    const numerator = xs.reduce((sum, value, index) => sum + (value - xMean) * (ys[index] - yMean), 0);
    const denominator = Math.sqrt(xs.reduce((sum, value) => sum + (value - xMean) ** 2, 0) * ys.reduce((sum, value) => sum + (value - yMean) ** 2, 0));
    return denominator ? numerator / denominator : null;
  })();

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
            APIx Airfare Index vs Official Consumer Price Index
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monthly APIx and MoSPI All-India General CPI, independently rebased to a common 100-point comparison base.
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
          <div className="text-2xl font-extrabold text-[#1769AA] mt-1">{latestAPIx?.airfareIndex?.toFixed(2) ?? 'N/A'}</div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-0.5">Rebased monthly APIx · {latestAPIx?.month ?? 'No overlap'}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">CPI General (MoSPI)</div>
          <div className="text-2xl font-extrabold text-[#0F8B8D] mt-1">{latestCPI?.cpiGeneralRaw?.toFixed(2) ?? 'N/A'}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Official published value · {latestCPI?.month ?? 'Not loaded'}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">CPI Transport Component</div>
          <div className="text-2xl font-extrabold text-[#6366F1] mt-1">
            {CPI_COMPARISON_META.transportSeriesAvailable ? 'Available' : 'N/A'}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Not included in the supplied MoSPI workbook</div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium uppercase">Observed Correlation</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{correlation === null ? 'Insufficient data' : `${correlation >= 0 ? '+' : ''}${correlation.toFixed(2)} r`}</div>
          <div className="text-[11px] text-[#0F8B8D] font-semibold mt-0.5">Calculated from loaded observations</div>
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
              domain={['dataMin - 2', 'dataMax + 2']}
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
                      <div className="flex justify-between gap-4 items-center text-[#1769AA]">
                        <span>APIx Airfare Index:</span>
                        <span className="font-bold">{payload.find((entry) => entry.dataKey === 'airfareIndex')?.value ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between gap-4 items-center text-[#0F8B8D]">
                        <span>CPI General (rebased):</span>
                        <span className="font-bold">{payload.find((entry) => entry.dataKey === 'cpiGeneral')?.value ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between gap-4 items-center text-[#64748B]">
                        <span>Official CPI raw:</span>
                        <span className="font-bold">{payload[0]?.payload?.cpiGeneralRaw ?? 'N/A'}</span>
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
              name="APIx (rebased monthly mean)"
              stroke="#1769AA"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1769AA', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cpiGeneral"
              name="MoSPI General CPI (rebased)"
              stroke="#0F8B8D"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: '#0F8B8D' }}
            />
            {CPI_COMPARISON_META.transportSeriesAvailable && (
              <Line type="monotone" dataKey="cpiTransport" name="CPI Transport & Comm. (rebased)"
                stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mandatory Analytical Notice (Prompt section 11 requirement) */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-[#172033]">
        <HelpCircle className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#1769AA]">Source and comparison note: </span>
          {CPI_COMPARISON_META.source}. {CPI_COMPARISON_META.note} Correlation is shown only when at least two matched monthly observations exist and does not imply causation.
        </div>
      </div>
    </div>
  );
};
