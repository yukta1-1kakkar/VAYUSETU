import React, { useState, useMemo } from 'react';
import { DATA_SOURCES, FLIGHT_ROUTES, ROUTE_WEIGHTS_DATA } from '../mock/airfareData';
import { formatINR, formatDelta } from '../utils/geo';
import { RouteIntelligenceModal } from '../components/command-center/RouteIntelligenceModal';
import {
  GitFork,
  Search,
  ArrowRight,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp
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

interface RouteAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

const RouteAxisTick: React.FC<RouteAxisTickProps> = ({ x = 0, y = 0, payload }) => (
  <text
    x={x - 8}
    y={y}
    dy="0.32em"
    textAnchor="end"
    fill="#172033"
    fontSize="11"
    fontWeight="600"
    style={{ whiteSpace: 'nowrap' }}
  >
    {payload?.value}
  </text>
);

interface SourceCoverageItem {
  name: string;
  observations: number;
  percentage: number;
}

const sourceKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function calculateSourceCoverage(sourceNames: readonly string[]): SourceCoverageItem[] {
  const observations = sourceNames.map((name) => {
    const source = DATA_SOURCES.find((item) => sourceKey(item.name) === sourceKey(name));
    return { name, observations: source?.recordsPerDay ?? 0 };
  });
  const total = observations.reduce((sum, item) => sum + item.observations, 0);

  return observations.map((item) => ({
    ...item,
    percentage: total > 0 ? item.observations / total * 100 : 0,
  }));
}

function CoverageBreakdown({ title, items }: { title: string; items: SourceCoverageItem[] }) {
  const accent = '#1769AA';
  const totalObservations = items.reduce((sum, item) => sum + item.observations, 0);

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4" aria-label={title}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-extrabold text-[#172033]">{title}</h3>
          <p className="mt-0.5 text-[10px] text-[#64748B]">Share of clean persisted fare observations in this source group.</p>
        </div>
        <span className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-[10px] font-bold text-[#64748B]">
          {totalObservations.toLocaleString('en-IN')} observations
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.name} className="rounded-xl border border-[#E2E8F0] bg-white p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[11px] font-bold text-[#334155]" title={item.name}>{item.name}</span>
              <span className="font-mono text-sm font-extrabold" style={{ color: accent }}>{item.percentage.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${item.percentage}%`, backgroundColor: accent }} />
            </div>
            <div className="mt-1.5 text-[9px] font-semibold text-[#94A3B8]">{item.observations.toLocaleString('en-IN')} records</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const RoutesPage: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ANOMALIES'>('ALL');
  const [airlineFilter, setAirlineFilter] = useState<string>('ALL');
  const [otaFilter, setOtaFilter] = useState<string>('ALL');
  const [analyticsMetric, setAnalyticsMetric] = useState<'fare' | 'weight' | 'change' | 'volatility'>('fare');
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false);

  // Available airline filter options
  const airlines = ['ALL', 'Akasa Air', 'Air India Express', 'SpiceJet'];
  const otaSources = ['ALL', 'Yatra'];
  const airlineCoverage = calculateSourceCoverage(airlines.filter((name) => name !== 'ALL'));

  const isCombinedView = airlineFilter === 'ALL' && otaFilter === 'ALL';
  const activeDataView = isCombinedView
    ? 'Combined - all airlines and OTA observations'
    : airlineFilter !== 'ALL' && otaFilter !== 'ALL'
      ? `${airlineFilter} via ${otaFilter}`
      : airlineFilter !== 'ALL'
        ? airlineFilter
        : `${otaFilter} OTA`;

  // Filtered routes list based on search, status, and airline
  const filteredRoutes = useMemo(() => {
    return FLIGHT_ROUTES.filter((route) => {
      const matchesSearch =
        route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.dominantCarrier.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'ANOMALIES' && !route.isAnomaly) return false;
      if (airlineFilter !== 'ALL' && route.primaryAirline !== airlineFilter && !route.dominantCarrier.includes(airlineFilter)) return false;
      if (otaFilter !== 'ALL' && !route.sources?.includes(otaFilter)) return false;

      return true;
    });
  }, [searchTerm, statusFilter, airlineFilter, otaFilter]);

  // Displayed routes: Top 10 by default, with an option to see all 24
  const displayedRoutes = useMemo(() => {
    if (showAllRoutes) {
      return filteredRoutes;
    }
    return filteredRoutes.slice(0, 10);
  }, [filteredRoutes, showAllRoutes]);

  // Chart data prepared from filtered routes
  const chartData = useMemo(() => {
    return displayedRoutes.map((route) => {
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
        airline: route.primaryAirline,
      };
    });
  }, [displayedRoutes]);

  // Reserve a dedicated row for every route so Recharts never suppresses or
  // wraps Y-axis labels when all 24 corridors are visible.
  const chartHeight = Math.max(384, chartData.length * 34 + 32);

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
            Aviation Route Network & Tariffs (08/2026)
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitored city-pair corridors across India separated by airline, with live fare quotes, volatility, and yield alerts.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search corridor, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] shadow-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            {(['ALL', 'ANOMALIES'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {st === 'ALL' ? 'All' : 'Anomalies'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Airline and OTA Source Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-xs font-bold text-[#172033]">
              <Building2 className="w-4 h-4 text-[#1769AA]" />
              <span>AIRLINE:</span>
            </div>
            {airlines.map((airline) => (
              <button
                key={airline}
                onClick={() => setAirlineFilter(airline)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  airlineFilter === airline
                    ? 'bg-[#1769AA] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]'
                }`}
              >
                {airline === 'ALL' ? 'All Airlines' : airline}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-l border-[#E2E8F0] pl-8 max-sm:border-l-0 max-sm:pl-0">
            <span className="mr-1 text-xs font-bold text-[#172033]">OTA:</span>
            {otaSources.map((source) => (
              <button
                key={source}
                onClick={() => setOtaFilter(source)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  otaFilter === source
                    ? 'bg-[#0F8B8D] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]'
                }`}
              >
                {source === 'ALL' ? 'All OTAs' : source}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#64748B]">
          Showing <span className="font-bold text-[#172033]">{displayedRoutes.length}</span> of {filteredRoutes.length} routes
        </div>
      </div>

      {airlineFilter === 'ALL' && <CoverageBreakdown title="Airline observation coverage" items={airlineCoverage} />}

      {/* ROUTE ANALYTICS GRAPH */}
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
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold">
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
              Volatility
            </button>
          </div>
        </div>

        {/* Horizontal Bar Chart (No "ROUTES" header in tooltip) */}
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 35, left: 12, bottom: 0 }}
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
                width={100}
                interval={0}
                stroke="#94A3B8"
                tick={<RouteAxisTick />}
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
                          <span className="text-[#64748B]">Volatility:</span>
                          <span className="font-semibold text-[#172033]">{data.volatility}/100</span>
                        </div>
                        <div className="text-[10px] text-[#94A3B8] pt-1">
                          Data view: {activeDataView}
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
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#EDF2F7] pt-4 text-[11px] font-semibold text-[#64748B]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Route status colours</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#1769AA]" /> Normal / stable corridor</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" /> Elevated fare movement</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" /> Anomaly / high-yield alert</span>
        </div>

        {/* Toggle Button: View Top 10 vs View All 24 */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAllRoutes(!showAllRoutes)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EDF2F7] border border-[#CBD5E1] text-xs font-bold text-[#1769AA] transition-all cursor-pointer shadow-xs"
          >
            <span>{showAllRoutes ? 'Show Top 10 Routes Only' : 'See all 24 routes'}</span>
            {showAllRoutes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Corridor Cards Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold font-heading text-[#172033]">
            Corridor Intelligence Dossiers ({displayedRoutes.length} of 24)
          </h3>
          <span className="text-xs text-[#64748B]">
            Click any card to open full econometric diagnostic
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRoutes.map((route) => {
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className="intel-card p-5 hover:border-[#1769AA] transition-all duration-200 cursor-pointer space-y-3 group shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base font-heading text-[#172033] group-hover:text-[#1769AA] transition-colors">
                        {route.originCity} → {route.destCity}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {route.id} • {route.distanceKm} km
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      route.isAnomaly
                        ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                        : route.changePercent >= 10
                        ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                        : 'bg-blue-50 text-[#1769AA] border border-blue-200'
                    }`}
                  >
                    {route.isAnomaly ? 'Anomaly' : route.changePercent >= 10 ? 'Elevated' : 'Normal'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9]">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#64748B] uppercase font-medium">Current Fare</div>
                    <div className="text-lg font-black font-heading text-[#172033] mt-0.5">
                      {formatINR(route.currentFare)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#64748B] uppercase font-medium">Monthly Shift</div>
                    <div className={`text-lg font-black font-heading mt-0.5 ${route.changePercent >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                      {formatDelta(route.changePercent)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#64748B] pt-1">
                  <span>Data: <strong className="text-[#172033]">{activeDataView}</strong></span>
                  <span>Volatility: <strong className="text-[#172033]">{route.volatilityIndex}/100</strong></span>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex justify-between items-center text-xs text-[#1769AA] font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Route Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Expand/Collapse Button */}
        {!showAllRoutes && filteredRoutes.length > 10 && (
          <div className="text-center pt-4">
            <button
              onClick={() => setShowAllRoutes(true)}
              className="px-6 py-3 rounded-xl bg-[#1769AA] hover:bg-[#12558A] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              See all 24 routes ({filteredRoutes.length - 10} more)
            </button>
          </div>
        )}
      </div>

      {/* Route Dossier Modal */}
      {selectedRouteId && (
        <RouteIntelligenceModal
          routeId={selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
          dataViewLabel={isCombinedView ? activeDataView : undefined}
        />
      )}
    </div>
  );
};
