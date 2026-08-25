import React, { useState } from 'react';
import { FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { soundFx } from '../../utils/sound';
import { Search, Filter, AlertTriangle, ArrowUpDown, ChevronRight, Plane, Activity, Sparkles } from 'lucide-react';

export const Part3_RouteNetworkExplorer: React.FC<{
  onSelectRoute: (routeId: string) => void;
}> = ({ onSelectRoute }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hubFilter, setHubFilter] = useState('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'fare' | 'change' | 'volatility'>('change');

  const filteredRoutes = FLIGHT_ROUTES.filter((route) => {
    const matchesSearch =
      route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destCity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHub =
      hubFilter === 'ALL' || route.origin === hubFilter || route.destination === hubFilter;

    const matchesAnomaly = !anomalyOnly || route.isAnomaly;

    return matchesSearch && matchesHub && matchesAnomaly;
  }).sort((a, b) => {
    if (sortBy === 'fare') return b.currentFare - a.currentFare;
    if (sortBy === 'change') return b.changePercent - a.changePercent;
    if (sortBy === 'volatility') return b.volatilityIndex - a.volatilityIndex;
    return 0;
  });

  return (
    <section id="part3-routes" className="space-y-6 pt-6">
      {/* Section Title */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 03 // DOMESTIC TRUNK ROUTE NETWORK CORRIDOR</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            High-Frequency Corridor Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Real-time price intelligence across India’s primary metro trunk routes with 30-day volatility envelopes.
          </p>
        </div>

        {/* Search & Anomaly Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route (e.g. DEL-BOM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setAnomalyOnly(!anomalyOnly);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              anomalyOnly
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>ANOMALIES ONLY</span>
          </button>
        </div>
      </div>

      {/* Hub Filter Chips & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <span className="text-slate-500 uppercase mr-1">HUB:</span>
          {['ALL', 'DEL', 'BOM', 'BLR', 'HYD', 'CCU'].map((hub) => (
            <button
              key={hub}
              onClick={() => {
                soundFx.playClick();
                setHubFilter(hub);
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                hubFilter === hub
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase">SORT:</span>
          {(['change', 'fare', 'volatility'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                soundFx.playClick();
                setSortBy(s);
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                sortBy === s ? 'text-indigo-300 font-bold underline' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'change' ? 'DELTA %' : s === 'fare' ? 'PRICE (₹)' : 'VOLATILITY'}
            </button>
          ))}
        </div>
      </div>

      {/* Corridor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            onClick={() => {
              soundFx.playClick();
              onSelectRoute(route.id);
            }}
            className={`tech-panel p-5 rounded-xl transition-all cursor-pointer group hover:-translate-y-0.5 ${
              route.isAnomaly ? 'tech-panel-alert' : ''
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-lg font-bold font-mono text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                  <span>{route.id}</span>
                  {route.isAnomaly && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse font-semibold">
                      YIELD SPIKE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-sans mt-0.5">
                  {route.originCity} → {route.destCity}
                </div>
              </div>

              <span
                className={`text-sm font-mono font-bold px-2 py-1 rounded ${
                  route.changePercent >= 15
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : route.changePercent >= 0
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {formatDelta(route.changePercent)}
              </span>
            </div>

            {/* Pricing metrics */}
            <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">CURRENT FARE</span>
                <span className="text-base font-bold text-white">{formatINR(route.currentFare)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">HISTORICAL AVG</span>
                <span className="text-base font-bold text-slate-400">{formatINR(route.historicalAvg)}</span>
              </div>
            </div>

            {/* Footer details */}
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vol: {route.volatilityIndex}/100</span>
              </span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                <span>INSPECT DOSSIER</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
