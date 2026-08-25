import React from 'react';
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
  ReferenceLine
} from 'recharts';
import { Landmark, TrendingDown, Scale, BarChart3, Info, CheckCircle2 } from 'lucide-react';

export const Part5_MacroeconomicCpiLab: React.FC = () => {
  return (
    <section id="part5-cpi" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 05 // MACROECONOMIC & CPI INFLATION DIVERGENCE LAB</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Airfare Index vs Consumer Price Inflation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Benchmarking domestic airfare velocity against MoSPI Headline CPI and Transport Component series.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 font-mono text-xs">
          <Scale className="w-4 h-4 text-indigo-400" />
          <span>MoSPI ALIGNED // BASE 100 JAN 2025</span>
        </div>
      </div>

      {/* Primary Chart & Economic Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (8 cols): Dual-Line Macro Benchmark Chart */}
        <div className="lg:col-span-8 tech-panel p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 font-mono text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-400" />
              DUAL-SERIES TIME-SERIES // AIRFARE INDEX VS CPI GENERAL & CPI TRANSPORT
            </span>
            <span className="text-slate-500">PERIOD: SEP 2024 - AUG 2026</span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CPI_DATA_SERIES} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[95, 135]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
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
                <Legend
                  wrapperStyle={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    paddingTop: '10px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="airfareIndex"
                  name="VAYUSETU Airfare Index"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#38BDF8' }}
                />
                <Line
                  type="monotone"
                  dataKey="cpiTransport"
                  name="CPI (Transport & Comm.)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="cpiGeneral"
                  name="Headline CPI (General)"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side (4 cols): Key Inflation Takeaways */}
        <div className="lg:col-span-4 space-y-4">
          <div className="tech-panel p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>DIVERGENCE SPREAD (-9.0%)</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Airfare volatility exhibits a <strong>3.4x higher standard deviation</strong> than headline CPI,
              leading to sharp cyclical divergences during peak festival quarters.
            </p>
          </div>

          <div className="tech-panel p-5 rounded-xl space-y-3 font-mono text-xs">
            <div className="text-slate-400 uppercase tracking-wider font-semibold">
              ECONOMIC WEIGHTING SUMMARY
            </div>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span>ATF Fuel Passthrough</span>
                <span className="text-white font-bold">42.8%</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span>Trunk Slot Congestion Factor</span>
                <span className="text-white font-bold">28.4%</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span>Forward Booking Curve</span>
                <span className="text-white font-bold">18.6%</span>
              </div>
              <div className="flex justify-between">
                <span>Seasonal Leisure Elasticity</span>
                <span className="text-white font-bold">10.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
