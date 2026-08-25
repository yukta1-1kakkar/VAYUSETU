import React, { useState, useMemo } from 'react';
import { formatINR, formatDelta, formatCount } from '../../utils/geo';
import {
  INDIA_STATES_PATHS,
  INDIA_SVG_WIDTH,
  INDIA_SVG_HEIGHT,
  AVIATION_HUBS,
  TOP_6_ROUTES,
  projectLngLatToMap,
  type IndiaStatePath,
  type AviationHub,
  type MapRouteArc,
} from './mapData';
import {
  MapPin,
  Navigation,
  Info,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Compass,
  Layers,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface IndiaMapProps {
  onSelectRoute?: (routeId: string) => void;
  className?: string;
  isIntroMode?: boolean;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  onSelectRoute,
  className = '',
  isIntroMode = false,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<MapRouteArc>(TOP_6_ROUTES[0]);
  const [selectedHub, setSelectedHub] = useState<AviationHub>(AVIATION_HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState<AviationHub | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<MapRouteArc | null>(null);
  const [hoveredState, setHoveredState] = useState<IndiaStatePath | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TOP6' | 'ANOMALIES'>('ALL');

  // Compute exact coordinates on the SVG map using authentic D3 projection
  const projectedHubs = useMemo(() => {
    return AVIATION_HUBS.map((hub) => {
      const { x, y } = projectLngLatToMap(hub.lng, hub.lat);
      return { ...hub, x, y };
    });
  }, []);

  const displayedHubs = projectedHubs.filter((h) => {
    if (activeFilter === 'TOP6') return h.isTop6;
    if (activeFilter === 'ANOMALIES') return h.anomalyStatus !== 'Normal';
    return true;
  });

  const handleRouteClick = (route: MapRouteArc) => {
    setSelectedRoute(route);
    const originHub = projectedHubs.find((h) => h.code === route.originCode);
    if (originHub) setSelectedHub(originHub);
    if (onSelectRoute) onSelectRoute(route.id);
  };

  return (
    <div className={`intel-card p-6 sm:p-8 w-full space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>AUTHENTIC SOVEREIGN POLITICAL MAP OF INDIA // 28 STATES & UTs</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#172033]">
            India Airfare Intelligence & Interactive Corridor Map
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Click any route line on the map to inspect live tariff telemetry, APIx impact, volatility, and historical price corridors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              All 9 Hubs
            </button>
            <button
              onClick={() => setActiveFilter('TOP6')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'TOP6'
                  ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Top 6 (Routes Active)
            </button>
            <button
              onClick={() => setActiveFilter('ANOMALIES')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'ANOMALIES'
                  ? 'bg-[#DC2626] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Anomalies Only
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Professional Layout (Left: ~68% Map, Right: ~32% Route Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authentic Political India Map */}
        <div className="lg:col-span-8 relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 min-h-[620px] sm:min-h-[740px] flex items-center justify-center overflow-hidden shadow-inner">
          {/* Top Floating Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-[#CBD5E1] text-[#1769AA] text-xs font-semibold shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>OFFICIAL STATE BOUNDARIES PROJECTION</span>
          </div>

          {/* Hovered State or Route Info Badge */}
          <div className="absolute bottom-4 left-4 z-20 font-sans text-xs text-[#64748B] bg-white/90 px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs">
            {hoveredState ? (
              <span className="font-semibold text-[#172033]">State: {hoveredState.name}</span>
            ) : (
              <span>Click any route line or city marker to view live telemetry</span>
            )}
          </div>

          {/* Route Hover Tooltip */}
          {hoveredRoute && (
            <div className="absolute top-4 right-4 z-30 bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-xl text-xs space-y-1 min-w-[210px] pointer-events-none animate-fadeIn">
              <div className="font-bold text-[#172033] flex items-center justify-between border-b border-[#F1F5F9] pb-1">
                <span>{hoveredRoute.originCode} ➔ {hoveredRoute.destCode}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                  hoveredRoute.status === 'anomaly'
                    ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                    : hoveredRoute.status === 'elevated'
                    ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                    : 'bg-blue-50 text-[#1769AA] border border-blue-200'
                }`}>
                  {hoveredRoute.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#64748B]">Current Fare:</span>
                <span className="font-bold text-[#172033]">{formatINR(hoveredRoute.currentFare)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Change:</span>
                <span className={`font-semibold ${hoveredRoute.fareChange >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                  {formatDelta(hoveredRoute.fareChange)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#94A3B8]">
                <span>Distance: {hoveredRoute.distanceKm} km</span>
                <span>{hoveredRoute.weeklyFlights} flts/wk</span>
              </div>
            </div>
          )}

          {/* SVG Map Canvas */}
          <svg
            viewBox={`0 0 ${INDIA_SVG_WIDTH} ${INDIA_SVG_HEIGHT}`}
            className="w-full h-full max-h-[740px] select-none overflow-visible"
          >
            <defs>
              <filter id="hubDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Latitude & Longitude Guidelines */}
            {[12, 16, 20, 24, 28, 32, 36].map((lat) => {
              const { y } = projectLngLatToMap(82.8, lat);
              return (
                <g key={`lat-${lat}`}>
                  <line x1={40} y1={y} x2={INDIA_SVG_WIDTH - 40} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={34} y={y + 3} fill="#94A3B8" fontSize="10" fontFamily="sans-serif" textAnchor="end">{lat}°N</text>
                </g>
              );
            })}

            {[72, 76, 80, 84, 88, 92, 96].map((lng) => {
              const { x } = projectLngLatToMap(lng, 22.8);
              return (
                <g key={`lng-${lng}`}>
                  <line x1={x} y1={40} x2={x} y2={INDIA_SVG_HEIGHT - 40} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={x} y={INDIA_SVG_HEIGHT - 22} fill="#94A3B8" fontSize="10" fontFamily="sans-serif" textAnchor="middle">{lng}°E</text>
                </g>
              );
            })}

            {/* Accurate Political States & Union Territories of India */}
            <g className="states-layer">
              {INDIA_STATES_PATHS.map((state) => {
                const isStateHovered = hoveredState?.name === state.name;
                const isSelectedState = selectedHub.state.toLowerCase().includes(state.name.toLowerCase()) || state.name.toLowerCase().includes(selectedHub.state.toLowerCase());

                return (
                  <path
                    key={`state-${state.name}`}
                    d={state.path}
                    fill={
                      isSelectedState
                        ? '#DBEAFE'
                        : isStateHovered
                        ? '#E0EDF9'
                        : '#E8EEF5'
                    }
                    stroke={isSelectedState ? '#3B82F6' : isStateHovered ? '#93C5FD' : '#CBD5E1'}
                    strokeWidth={isSelectedState ? '1.8' : isStateHovered ? '1.4' : '1.0'}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-colors duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      const matchedHub = projectedHubs.find(
                        (h) => h.state.toLowerCase().includes(state.name.toLowerCase()) || state.name.toLowerCase().includes(h.state.toLowerCase())
                      );
                      if (matchedHub) setSelectedHub(matchedHub);
                    }}
                  >
                    <title>{state.name}</title>
                  </path>
                );
              })}
            </g>

            {/* Smooth Clickable Flight Route Arcs (Strictly between Top 6 Hubs) */}
            <g className="routes-layer">
              {TOP_6_ROUTES.map((route) => {
                const fromHub = projectedHubs.find((h) => h.code === route.originCode);
                const toHub = projectedHubs.find((h) => h.code === route.destCode);
                if (!fromHub || !toHub) return null;

                const isRouteSelected = selectedRoute.id === route.id;
                const isHovered = hoveredRoute?.id === route.id;

                // Smooth quadratic curve control point
                const midX = (fromHub.x + toHub.x) / 2 - (fromHub.y - toHub.y) * 0.16;
                const midY = (fromHub.y + toHub.y) / 2 - (toHub.x - fromHub.x) * 0.16;

                const strokeColor =
                  route.status === 'anomaly'
                    ? '#DC2626'
                    : route.status === 'elevated'
                    ? '#D97706'
                    : '#1769AA';

                return (
                  <g key={route.id} className="cursor-pointer">
                    {/* Invisible thick hover & click target */}
                    <path
                      d={`M ${fromHub.x} ${fromHub.y} Q ${midX} ${midY} ${toHub.x} ${toHub.y}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      onMouseEnter={() => setHoveredRoute(route)}
                      onMouseLeave={() => setHoveredRoute(null)}
                      onClick={() => handleRouteClick(route)}
                    />

                    {/* Selected Route Focus Glow / Halo Ring */}
                    {isRouteSelected && (
                      <path
                        d={`M ${fromHub.x} ${fromHub.y} Q ${midX} ${midY} ${toHub.x} ${toHub.y}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="8"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Visible Route Line */}
                    <path
                      d={`M ${fromHub.x} ${fromHub.y} Q ${midX} ${midY} ${toHub.x} ${toHub.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isRouteSelected ? 3.8 : isHovered ? 3.2 : 1.8}
                      strokeOpacity={isRouteSelected || isHovered ? 1 : 0.65}
                      strokeDasharray={route.status === 'anomaly' ? 'none' : isRouteSelected ? 'none' : '4 3'}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                      onClick={() => handleRouteClick(route)}
                    />
                  </g>
                );
              })}
            </g>

            {/* Aviation Hub Beacons on Map */}
            <g className="beacons-layer">
              {displayedHubs.map((hub) => {
                const isSelected = selectedHub.id === hub.id || selectedRoute.originCode === hub.code || selectedRoute.destCode === hub.code;
                const isHovered = hoveredHub?.id === hub.id;

                return (
                  <g
                    key={`hub-beacon-${hub.id}`}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedHub(hub);
                      const matchingRoute = TOP_6_ROUTES.find((r) => r.originCode === hub.code || r.destCode === hub.code);
                      if (matchingRoute) setSelectedRoute(matchingRoute);
                    }}
                  >
                    {/* Pulse Ring for Selected / Anomaly */}
                    {(isSelected || hub.anomalyStatus === 'Critical Anomaly') && (
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isSelected ? 22 : 16}
                        fill={hub.anomalyStatus === 'Critical Anomaly' ? '#DC2626' : '#1769AA'}
                        opacity={isSelected ? 0.18 : 0.12}
                      />
                    )}

                    {/* Outer Hub Ring */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hub.isTop6 ? 8 : 6}
                      fill="#FFFFFF"
                      stroke={
                        hub.anomalyStatus === 'Critical Anomaly'
                          ? '#DC2626'
                          : isSelected
                          ? '#1769AA'
                          : '#64748B'
                      }
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter="url(#hubDropShadow)"
                    />

                    {/* Inner Hub Center Point */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hub.isTop6 ? 3.5 : 2.5}
                      fill={
                        hub.anomalyStatus === 'Critical Anomaly'
                          ? '#DC2626'
                          : isSelected
                          ? '#1769AA'
                          : '#0F8B8D'
                      }
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Interactive HTML Location Pills */}
          {displayedHubs.map((hub) => {
            const isSelected = selectedHub.id === hub.id || selectedRoute.originCode === hub.code || selectedRoute.destCode === hub.code;
            const isHovered = hoveredHub?.id === hub.id;
            const leftPercent = (hub.x / INDIA_SVG_WIDTH) * 100;
            const topPercent = (hub.y / INDIA_SVG_HEIGHT) * 100;

            return (
              <div
                key={hub.id}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -140%)',
                }}
                onMouseEnter={() => setHoveredHub(hub)}
                onMouseLeave={() => setHoveredHub(null)}
                onClick={() => {
                  setSelectedHub(hub);
                  const matchingRoute = TOP_6_ROUTES.find((r) => r.originCode === hub.code || r.destCode === hub.code);
                  if (matchingRoute) setSelectedRoute(matchingRoute);
                }}
                className={`absolute z-30 cursor-pointer select-none transition-all duration-150 ${
                  isSelected || isHovered ? 'scale-110 z-40' : 'scale-95 hover:scale-105'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-xs transition-all ${
                    isSelected
                      ? 'bg-[#1769AA] border-[#1769AA] text-white shadow-md'
                      : hub.anomalyStatus === 'Critical Anomaly'
                      ? 'bg-white border-[#DC2626] text-[#DC2626] shadow-xs'
                      : 'bg-white/95 border-[#CBD5E1] text-[#172033] hover:border-[#1769AA]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? 'bg-white'
                        : hub.anomalyStatus === 'Critical Anomaly'
                        ? 'bg-[#DC2626] animate-pulse'
                        : hub.isTop6
                        ? 'bg-[#1769AA]'
                        : 'bg-[#64748B]'
                    }`}
                  />
                  <span>{hub.city.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Route Details & Corridor Intelligence Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#1769AA] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              ROUTE DETAILS & CORRIDOR INTELLIGENCE
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              selectedRoute.status === 'anomaly'
                ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                : selectedRoute.status === 'elevated'
                ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                : 'bg-blue-50 text-[#1769AA] border border-blue-200'
            }`}>
              {selectedRoute.status}
            </span>
          </div>

          {/* Route Details Card */}
          <div className={`p-6 rounded-2xl border transition-all ${
            selectedRoute.status === 'anomaly'
              ? 'bg-white border-rose-200 shadow-md'
              : 'bg-white border-[#E2E8F0] shadow-sm'
          }`}>
            {/* Header info */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">
                  Selected Corridor
                </div>
                <h4 className="text-2xl font-black font-heading text-[#172033] flex items-center gap-2 mt-0.5">
                  <span>{selectedRoute.originCity}</span>
                  <span className="text-[#1769AA]">→</span>
                  <span>{selectedRoute.destCity}</span>
                </h4>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {selectedRoute.id} • {selectedRoute.distanceKm} km • {selectedRoute.weeklyFlights} flights/week
                </div>
              </div>
            </div>

            {/* Dynamic Route Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Current Fare</div>
                <div className="text-xl font-extrabold text-[#172033] mt-0.5">
                  {formatINR(selectedRoute.currentFare)}
                </div>
                <div className={`text-[10px] font-bold mt-0.5 ${selectedRoute.fareChange >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                  {formatDelta(selectedRoute.fareChange)} vs baseline
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Historical Avg</div>
                <div className="text-xl font-extrabold text-[#64748B] mt-0.5">
                  {formatINR(selectedRoute.historicalAvg)}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">60-day median tariff</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Basket Weight</div>
                <div className="text-xl font-extrabold text-[#1769AA] mt-0.5">
                  {selectedRoute.weight}%
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Pax-km contribution</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Volatility Index</div>
                <div className="text-xl font-extrabold text-[#172033] mt-0.5">
                  {selectedRoute.volatility}/100
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Booking curve variance</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Observations</div>
                <div className="text-xl font-extrabold text-[#172033] mt-0.5">
                  {formatCount(selectedRoute.observations)}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Quotes sampled</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B] font-medium uppercase">Dominant Carrier</div>
                <div className="text-xs font-extrabold text-[#172033] mt-1.5 truncate">
                  {selectedRoute.dominantCarrier}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Major market share</div>
              </div>
            </div>

            {/* Historical 30-Day Trend Curve */}
            {selectedRoute.historicalData && (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#172033]">30-Day Fare Trajectory</span>
                  <span className="text-[#1769AA] font-semibold">Min: ₹3,890 • Max: ₹12,400</span>
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedRoute.historicalData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mapDetailGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedRoute.status === 'anomaly' ? '#DC2626' : '#1769AA'} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={selectedRoute.status === 'anomaly' ? '#DC2626' : '#1769AA'} stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} />
                      <Area
                        type="monotone"
                        dataKey="fare"
                        stroke={selectedRoute.status === 'anomaly' ? '#DC2626' : '#1769AA'}
                        strokeWidth={2}
                        fill="url(#mapDetailGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Anomaly Diagnosis or Regular Market Note */}
            {selectedRoute.anomalyReason ? (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#172033] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-[#DC2626]">Yield Alert: </span>
                  {selectedRoute.anomalyReason}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                <span className="font-semibold text-[#172033]">Corridor Stability: </span>
                This trunk pair is pricing within historical equilibrium bands without systemic yield disruption.
              </div>
            )}

            {/* Quick Action */}
            <button
              onClick={() => {
                if (onSelectRoute) onSelectRoute(selectedRoute.id);
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <span>OPEN FULL {selectedRoute.id} INTELLIGENCE DOSSIER</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
