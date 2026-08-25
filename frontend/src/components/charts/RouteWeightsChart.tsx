import React from 'react';
import { ROUTE_WEIGHTS_DATA } from '../../mock/airfareData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Layers, Info, AlertTriangle } from 'lucide-react';

export const RouteWeightsChart: React.FC = () => {
  return (
    <div className="intel-card p-6 sm:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1769AA] uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>INDEX BASKET COMPOSITION</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#172033]">
            Corridor Weights & APIx Basket Contribution
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Statistical weights assigned to primary trunk and regional city pairs based on passenger-kilometer volume and frequency.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#64748B] px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          Total Basket: <span className="text-[#1769AA] font-bold">24 Route Pairs</span>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ROUTE_WEIGHTS_DATA}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 35, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 20]}
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              type="category"
              dataKey="routeId"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#172033', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[210px]">
                      <div className="font-bold text-[#172033] border-b border-[#F1F5F9] pb-1 flex justify-between">
                        <span>{data.originCity} ➔ {data.destCity}</span>
                        <span className="text-[#1769AA]">{data.routeId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Basket Weight:</span>
                        <span className="font-bold text-[#1769AA]">{data.weight}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Index Impact Points:</span>
                        <span className="font-semibold text-[#172033]">{data.contribution} pts</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Est. Monthly Pax:</span>
                        <span className="font-medium text-[#64748B]">{data.paxPerMonth}</span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8] pt-1">
                        Carriers: {data.carrierShare}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
              {ROUTE_WEIGHTS_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.status === 'anomaly'
                      ? '#DC2626'
                      : entry.status === 'elevated'
                      ? '#D97706'
                      : '#1769AA'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Details Table Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded bg-[#1769AA] shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-[#172033]">Normal Baseline Weights</div>
            <div className="text-[#64748B]">Standard equilibrium corridors</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded bg-[#D97706] shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-[#172033]">Elevated Yield Corridors</div>
            <div className="text-[#64748B]">Above average price volatility</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded bg-[#DC2626] shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-[#172033]">Active Yield Anomaly</div>
            <div className="text-[#64748B]">DEL-BOM (16.4%), DEL-CCU (8.9%)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
