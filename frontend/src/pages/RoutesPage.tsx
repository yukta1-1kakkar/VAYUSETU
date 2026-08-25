import React, { useState, useMemo } from 'react';
import { FLIGHT_ROUTES, ROUTE_WEIGHTS_DATA } from '../mock/airfareData';
import { formatINR, formatDelta, formatCount } from '../utils/geo';
import { RouteIntelligenceModal } from '../components/command-center/RouteIntelligenceModal';
import {
  GitFork,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Plane,
  Activity,
  CheckCircle2,
  BarChart3,
  Layers,
  TrendingUp,
  Percent,
  Sliders
} from 'lucide-react';
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

export const RoutesPage: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ANOMALIES' | 'TRUNK'>('ALL');
  const [analyticsMetric, setAnalyticsMetric] = useState<'fare' | 'weight' | 'change' | 'volatility'>('fare');

  // Filtered routes list based on search and status tabs
  const filteredRoutes = useMemo(() => {
    return FLIGHT_ROUTES.filter((route) => {
      const matchesSearch =
        route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.dominantCarrier.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'ANOMALIES') return route.isAnomaly;
      if (statusFilter === 'TRUNK') return route.weeklyFrequency >= 200;
      return true;
    });
  }, [searchTerm, statusFilter]);

  // Chart data prepared from filtered routes
  const chartData = useMemo(() => {
    return filteredRoutes.map((route) => {
      const weightObj = ROUTE_WEIGHTS_DATA.find((w) => w.routeId === route.id);
      return {
        id: route.id,
        name: `${route.origin} → ${route.destination}`,
        originCity: route.originCity,
        destCity: route.destCity,
        fare: route.currentFare,
        referenceFare: route.referenceFare,
        weight: weightObj ? weightObj.weight : 4.5,
        change: route.changePercent,
        volatility: route.volatilityIndex,
        status: route.isAnomaly ? 'anomaly' : route.changePercent >= 10 ? 'elevated' : 'normal',
        dominantCarrier: route.dominantCarrier,
      };
    });
  }, [filteredRoutes]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>NATIONAL CORRIDOR MATRIX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            Aviation Route Network & Tariffs
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitored high-frequency trunk and regional city pairs across India with live fare quotes, volatility indices, and yield alerts.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route, city, carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            {(['ALL', 'ANOMALIES', 'TRUNK'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {st === 'ALL' ? 'All Routes' : st === 'ANOMALIES' ? 'Anomalies Only' : 'Trunk Corridors'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NEW SECTION: ROUTE ANALYTICS GRAPH (Section 2 requirement) */}
      <section className="intel-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>ROUTE ANALYTICS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#172033]">
              Corridor Comparison & Performance Benchmark
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comparative visualization across monitored city pairs. Click any bar to inspect the complete dossier.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold">
            <button
              onClick={() => setAnalyticsMetric('fare')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                analyticsMetric === 'fare'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Current Fare (₹)
            </button>
            <button
              onClick={() => setAnalyticsMetric('weight')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                analyticsMetric === 'weight'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Route Weight (%)
            </button>
            <button
              onClick={() => setAnalyticsMetric('change')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                analyticsMetric === 'change'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Fare Change (%)
            </button>
            <button
              onClick={() => setAnalyticsMetric('volatility')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                analyticsMetric === 'volatility'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Volatility Index
            </button>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="h-72 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 35, left: 35, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis
                type="number"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(v) =>
                  analyticsMetric === 'fare'
                    ? `₹${v.toLocaleString()}`
                    : analyticsMetric === 'weight'
                    ? `${v}%`
                    : analyticsMetric === 'change'
                    ? `${v}%`
                    : `${v}`
                }
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                type="category"
                dataKey="name"
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
                      <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[220px]">
                        <div className="font-bold text-[#172033] border-b border-[#F1F5F9] pb-1 flex justify-between">
                          <span>{data.originCity} ➔ {data.destCity}</span>
                          <span className="text-[#1769AA] font-mono">{data.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Current Fare:</span>
                          <span className="font-bold text-[#172033]">{formatINR(data.fare)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Reference Base:</span>
                          <span className="font-medium text-[#64748B]">{formatINR(data.referenceFare)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Monthly Shift:</span>
                          <span className={`font-bold ${data.change >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                            {formatDelta(data.change)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">APIx Basket Weight:</span>
                          <span className="font-bold text-[#1769AA]">{data.weight}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Volatility Index:</span>
                          <span className="font-semibold text-[#172033]">{data.volatility}/100</span>
                        </div>
                        <div className="text-[10px] text-[#94A3B8] pt-1">
                          Carrier: {data.dominantCarrier}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={analyticsMetric}
                radius={[0, 6, 6, 0]}
                onClick={(data) => {
                  if (data && data.id) setSelectedRouteId(data.id);
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
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

        {/* Graph Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1769AA]" />
              <span>Normal Pricing</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#D97706]" />
              <span>Elevated Yield</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#DC2626]" />
              <span>Critical Anomaly</span>
            </span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Showing {chartData.length} monitored routes in current filter
          </div>
        </div>
      </section>

      {/* Routes Grid View */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#172033] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
          <span>Detailed Corridor Cards & Tariff Dossiers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => {
            const weightObj = ROUTE_WEIGHTS_DATA.find((w) => w.routeId === route.id);
            const isAnomaly = route.isAnomaly;

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`intel-card p-5 cursor-pointer transition-all hover:shadow-md ${
                  isAnomaly ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300' : 'hover:border-[#1769AA]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold font-heading text-[#172033]">
                        {route.originCity} → {route.destCity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#F1F5F9] text-[#1769AA] font-mono font-bold">
                        {route.id}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {route.distanceKm} km • {route.weeklyFrequency} weekly flights
                    </div>
                  </div>

                  {isAnomaly ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#DC2626] font-bold text-[10px] uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Anomaly
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] font-semibold text-[10px] uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Stable
                    </span>
                  )}
                </div>

                {/* Pricing Row */}
                <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-xl bg-white border border-[#E2E8F0]">
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase font-medium">Observed Fare</div>
                    <div className="text-xl font-extrabold text-[#172033] mt-0.5">
                      {formatINR(route.currentFare)}
                    </div>
                    <div className={`text-[11px] font-bold mt-0.5 ${route.changePercent >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                      {formatDelta(route.changePercent)} vs base
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-[#64748B] uppercase font-medium">APIx Basket Weight</div>
                    <div className="text-xl font-extrabold text-[#1769AA] mt-0.5">
                      {weightObj ? `${weightObj.weight}%` : '4.5%'}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Ref: {formatINR(route.referenceFare)}
                    </div>
                  </div>
                </div>

                {/* Carrier & Observations */}
                <div className="flex justify-between items-center text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                  <span className="truncate max-w-[170px]">{route.dominantCarrier}</span>
                  <span className="font-medium text-[#1769AA] flex items-center gap-1 hover:underline">
                    Dossier <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Route Dossier Modal */}
      {selectedRouteId && (
        <RouteIntelligenceModal
          routeId={selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
        />
      )}
    </div>
  );
};
