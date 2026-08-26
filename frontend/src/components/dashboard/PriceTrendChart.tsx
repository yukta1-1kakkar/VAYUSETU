import React, { useState, useMemo } from 'react';
import { FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
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
import { TrendingUp, Info, Navigation, Search } from 'lucide-react';

export const PriceTrendChart: React.FC = () => {
  // Route selection with all 24 routes + ALL option
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');

  const months = ['01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26'];
  const nationalMultipliers = [0.94, 0.955, 0.968, 0.98, 1.01, 0.994, 0.987, 1.00];

  // Dynamic calculation for any selected route across the 8 months
  const chartData = useMemo(() => {
    return months.map((month, idx) => {
      const natBase = 5420;
      const point: Record<string, any> = {
        date: month,
        nationalIndex: Math.round(natBase * nationalMultipliers[idx]),
      };

      if (selectedRouteId === 'ALL') {
        // Show primary trunk corridors by default
        const delBomRoute = FLIGHT_ROUTES.find(r => r.id === 'DEL-BOM')!;
        const delBlrRoute = FLIGHT_ROUTES.find(r => r.id === 'DEL-BLR')!;
        const delCcuRoute = FLIGHT_ROUTES.find(r => r.id === 'DEL-CCU')!;
        const bomBlrRoute = FLIGHT_ROUTES.find(r => r.id === 'BOM-BLR')!;

        const delBomBase = delBomRoute.referenceFare;
        const delBlrBase = delBlrRoute.referenceFare;
        const delCcuBase = delCcuRoute.referenceFare;
        const bomBlrBase = bomBlrRoute.referenceFare;

        point['delBom'] = Math.round(delBomBase * (0.95 + idx * 0.065));
        point['delBlr'] = Math.round(delBlrBase * (0.93 + idx * 0.021));
        point['delCcu'] = Math.round(delCcuBase * (0.88 + idx * 0.052));
        point['bomBlr'] = Math.round(bomBlrBase * (0.96 + idx * 0.012));
      } else {
        const route = FLIGHT_ROUTES.find(r => r.id === selectedRouteId) || FLIGHT_ROUTES[0];
        const base = route.referenceFare || 5000;
        const trendSlope = route.changePercent >= 15 ? 0.055 : route.changePercent >= 5 ? 0.025 : 0.01;
        point['selectedRoute'] = Math.round(base * (0.92 + idx * trendSlope));
      }

      return point;
    });
  }, [selectedRouteId]);

  const activeRouteObj = useMemo(() => {
    if (selectedRouteId === 'ALL') return null;
    return FLIGHT_ROUTES.find(r => r.id === selectedRouteId) || null;
  }, [selectedRouteId]);

  return (
    <div className="intel-card p-6 sm:p-7 w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1769AA] uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CORRIDOR TARIFF EVOLUTION</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#172033]">
            Price Trend Matrix (FY 26)
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Multi-corridor economy fare trajectories benchmarked against the weighted National Index from 01/26 to 08/26.
          </p>
        </div>

        {/* Route Selector with All 24 Routes */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-bold text-[#64748B] whitespace-nowrap">Corridor:</span>
          <div className="relative flex-1 sm:w-60">
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#172033] focus:outline-none focus:border-[#1769AA] shadow-xs cursor-pointer"
            >
              <option value="ALL">All Trunk Overview</option>
              <optgroup label="Primary Trunk Corridors (Top 6)">
                {FLIGHT_ROUTES.slice(0, 6).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.originCity} ➔ {r.destCity}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Arterial & Regional Corridors (7-24)">
                {FLIGHT_ROUTES.slice(6).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.originCity} ➔ {r.destCity}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Route Info Strip */}
      {activeRouteObj && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-[#1769AA]" />
            <span className="font-bold text-[#172033]">{activeRouteObj.originCity} ➔ {activeRouteObj.destCity}</span>
            <span className="text-[#64748B]">({activeRouteObj.id} • {activeRouteObj.primaryAirline})</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Current Fare: <strong className="text-[#172033]">{formatINR(activeRouteObj.currentFare)}</strong></span>
            <span>Monthly Shift: <strong className={activeRouteObj.changePercent >= 10 ? 'text-[#DC2626]' : 'text-[#1769AA]'}>{formatDelta(activeRouteObj.changePercent)}</strong></span>
            <span>Volatility: <strong className="text-[#172033]">{activeRouteObj.volatilityIndex}/100</strong></span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-72 sm:h-84 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <div className="font-bold text-[#172033] border-b border-[#F1F5F9] pb-1">
                        Period: {label}
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-4">
                          <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
                          <span className="font-bold text-[#172033]">{formatINR(Number(entry.value))}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            {selectedRouteId === 'ALL' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="delBom"
                  name="DEL → BOM (Surge)"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#DC2626' }}
                />
                <Line
                  type="monotone"
                  dataKey="delBlr"
                  name="DEL → BLR"
                  stroke="#0F8B8D"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0F8B8D' }}
                />
                <Line
                  type="monotone"
                  dataKey="delCcu"
                  name="DEL → CCU"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#D97706' }}
                />
                <Line
                  type="monotone"
                  dataKey="bomBlr"
                  name="BOM → BLR"
                  stroke="#8B5CF6"
                  strokeWidth={1.8}
                  dot={{ r: 2.5, fill: '#8B5CF6' }}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="selectedRoute"
                name={`${activeRouteObj?.origin} → ${activeRouteObj?.destination}`}
                stroke="#1769AA"
                strokeWidth={3.5}
                dot={{ r: 4, fill: '#1769AA', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            )}

            <Line
              type="monotone"
              dataKey="nationalIndex"
              name="National Benchmark"
              stroke="#64748B"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#64748B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with Hoverable Calculation Tooltip */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
        <div className="relative group/tip cursor-pointer">
          <div className="flex items-center gap-1.5 text-[#64748B] hover:text-[#1769AA] font-semibold transition-colors">
            <Info className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>Tariff Calculation Scope</span>
          </div>

          <div className="absolute bottom-6 left-0 z-50 w-72 p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-xl text-[11px] text-[#172033] leading-relaxed opacity-0 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:pointer-events-auto transition-opacity duration-150">
            <div className="font-bold text-[#1769AA] border-b border-[#F1F5F9] pb-1 mb-1">
              Corridor Pricing Scope
            </div>
            Corridor tariffs reflect weighted economy bucket averages across 0-30 day advance bookings for FY 26 across verified airlines.
          </div>
        </div>

        <span className="text-[11px] text-[#94A3B8]">Updated monthly • FY 26</span>
      </div>
    </div>
  );
};
