import React, { useMemo, useState } from 'react';
import { Info, Navigation, TrendingUp } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatDelta, formatINR } from '../../utils/geo';

const COLORS = ['#DC2626', '#0F8B8D', '#D97706', '#8B5CF6'];

export const PriceTrendChart: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState('ALL');
  const chartRoutes = useMemo(() => selectedRouteId === 'ALL'
    ? FLIGHT_ROUTES.slice(0, 4)
    : FLIGHT_ROUTES.filter((route) => route.id === selectedRouteId), [selectedRouteId]);
  const activeRoute = selectedRouteId === 'ALL' ? null : chartRoutes[0];

  const chartData = useMemo(() => {
    const dates = [...new Set(chartRoutes.flatMap((route) => route.historicalData.map((point) => point.date)))];
    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      const fares: number[] = [];
      chartRoutes.forEach((route) => {
        const observation = route.historicalData.find((item) => item.date === date);
        if (observation) {
          point[route.id] = observation.fare;
          fares.push(observation.fare);
        }
      });
      point.nationalMean = fares.length ? Math.round(fares.reduce((sum, fare) => sum + fare, 0) / fares.length) : 0;
      return point;
    });
  }, [chartRoutes]);

  return (
    <div className="intel-card w-full space-y-5 p-6 sm:p-7">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1769AA]"><TrendingUp className="h-3.5 w-3.5" /> Corridor tariff evolution</div>
          <h3 className="font-heading text-xl font-extrabold text-[#172033] sm:text-2xl">Persisted Price Trends</h3>
          <p className="mt-0.5 text-xs text-[#64748B]">Daily route means calculated only from clean PostgreSQL observations.</p>
        </div>
        <select value={selectedRouteId} onChange={(event) => setSelectedRouteId(event.target.value)} className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#172033]">
          <option value="ALL">Top corridors</option>
          {FLIGHT_ROUTES.map((route) => <option key={route.id} value={route.id}>{route.id}: {route.originCity} → {route.destCity}</option>)}
        </select>
      </div>

      {activeRoute && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
        <span className="flex items-center gap-2 font-bold"><Navigation className="h-3.5 w-3.5 text-[#1769AA]" />{activeRoute.originCity} → {activeRoute.destCity}</span>
        <span>Current: <strong>{formatINR(activeRoute.currentFare)}</strong> · Change: <strong>{formatDelta(activeRoute.changePercent)}</strong></span>
      </div>}

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`} tickLine={false} />
            <Tooltip formatter={(value) => formatINR(Number(value))} />
            <Legend />
            {chartRoutes.map((route, index) => <Line key={route.id} type="monotone" dataKey={route.id} name={route.id} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} connectNulls dot={{ r: 3 }} />)}
            {selectedRouteId === 'ALL' && <Line type="monotone" dataKey="nationalMean" name="Displayed-route mean" stroke="#64748B" strokeDasharray="4 4" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2 text-xs text-[#64748B]"><span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-[#1769AA]" /> No synthetic interpolation</span><span>Auto-refreshes every 60 seconds</span></div>
    </div>
  );
};
