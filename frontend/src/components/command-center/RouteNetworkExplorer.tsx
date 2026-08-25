import React, { useState } from 'react';
import { FLIGHT_ROUTES, AIRPORTS } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { Search, Filter, AlertTriangle, ArrowUpRight, Radio } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const RouteNetworkExplorer: React.FC<{
  onSelectRoute: (id: string) => void;
}> = ({ onSelectRoute }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('ALL');
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState(false);

  const hubs = ['ALL', 'DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'PNQ'];

  const filteredRoutes = FLIGHT_ROUTES.filter((route) => {
    const matchesSearch =
      route.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destCity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHub =
      selectedHub === 'ALL' || route.origin === selectedHub || route.destination === selectedHub;

    const matchesAnomaly = !filterAnomaliesOnly || route.isAnomaly;

    return matchesSearch && matchesHub && matchesAnomaly;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search route or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
          />
        </div>

        {/* Hub Filters & Anomaly Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs">
            {hubs.map((hub) => (
              <button
                key={hub}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedHub(hub);
                }}
                className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                  selectedHub === hub
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setFilterAnomaliesOnly(!filterAnomaliesOnly);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              filterAnomaliesOnly
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ANOMALIES ONLY</span>
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => {
          const isAnomaly = route.isAnomaly;

          return (
            <div
              key={route.id}
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(route.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isAnomaly
                  ? 'tech-panel-alert'
                  : 'bg-[#080D1A]/90 border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/80 shadow-lg'
              }`}
            >
              <div>
                {/* Route Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-lg font-black font-syne text-white flex items-center gap-2">
                      <span>{route.origin}</span>
                      <span className="text-slate-500 font-normal">→</span>
                      <span>{route.destination}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {route.originCity} to {route.destCity}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isAnomaly
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                          : route.changePercent > 10
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {formatDelta(route.changePercent)}
                    </span>
                  </div>
                </div>

                {/* Main Metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">CURRENT FARE</span>
                    <span className="text-base font-bold text-white">{formatINR(route.currentFare)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">REFERENCE</span>
                    <span className="text-base font-bold text-slate-300">{formatINR(route.referenceFare)}</span>
                  </div>
                </div>

                {isAnomaly && (
                  <div className="text-[11px] font-mono text-rose-300 mb-3 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{route.anomalyReason}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
                <span>{route.observationsCount} sampled quotes</span>
                <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Inspect <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
