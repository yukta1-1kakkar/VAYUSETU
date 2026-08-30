import React, { useState } from 'react';
import { SECTOR_HEATMAP_DATA, FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { Grid, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Filter, Layers, ArrowUpRight } from 'lucide-react';

const CONFIGURED_SCRAPE_SOURCES = new Set(['Akasa Air', 'Air India Express', 'SpiceJet', 'Yatra']);

export const SectorHeatmap: React.FC = () => {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [hoveredCell, setHoveredCell] = useState<{
    origin: string;
    dest: string;
    fare: number;
    change: number;
    index: number;
    status: 'green' | 'yellow' | 'red';
    scrapedSources: string;
  } | null>(null);

  // Use the complete directional basket. A shared seven-airport axis dropped
  // every route touching airports outside that arbitrary subset.
  const origins = Array.from(new Set(FLIGHT_ROUTES.map((route) => route.origin)));
  const destinations = Array.from(new Set(FLIGHT_ROUTES.map((route) => route.destination)));

  // Matrix cell lookup helper
  const getMatrixCell = (origin: string, dest: string) => {
    if (origin === dest) return null;
    // Airfares are directional; never mirror A→B into B→A.
    const directRoute = FLIGHT_ROUTES.find(r => r.origin === origin && r.destination === dest);
    if (!directRoute) return null;

    const change = directRoute.changePercent;
    const indexScore = directRoute.referenceFare > 0
      ? Math.round((directRoute.currentFare / directRoute.referenceFare) * 100)
      : 0;
    
    // Status color tiers
    const status: 'green' | 'yellow' | 'red' = change >= 15 ? 'red' : change >= 5 ? 'yellow' : 'green';
    const scrapedSources = (directRoute.sources ?? [])
      .filter((source) => CONFIGURED_SCRAPE_SOURCES.has(source));
    if (!scrapedSources.length && CONFIGURED_SCRAPE_SOURCES.has(directRoute.primaryAirline)) {
      scrapedSources.push(directRoute.primaryAirline);
    }

    return {
      routeId: directRoute.id,
      origin,
      dest,
      fare: directRoute.currentFare,
      change,
      indexScore,
      status,
      scrapedSources: scrapedSources.join(' / ') || 'No configured source',
      isAnomaly: directRoute.isAnomaly
    };
  };

  const getHeatBg = (status: 'green' | 'yellow' | 'red' | null) => {
    if (!status) return 'bg-slate-100/60 border-slate-200 text-slate-300';
    switch (status) {
      case 'red':
        return 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-200 border-red-500 font-extrabold hover:scale-105';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 shadow-amber-100 border-amber-400 font-bold hover:scale-105';
      case 'green':
        return 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200 border-emerald-500 font-bold hover:scale-105';
    }
  };

  return (
    <div className="intel-card p-6 sm:p-8 w-full space-y-6">
      {/* Header with View Mode Switcher and Heat Legend */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <Grid className="w-3.5 h-3.5" />
            <span>INTERACTIVE YIELD HEATMAP</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#172033]">
            Corridor & Sector-wise Tariff Heatmap
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Visual yield stress dispersion matrix across key city pairs categorized into Green, Yellow, and Red alert zones.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              City-Pair Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Sector Cards
            </button>
          </div>
        </div>
      </div>

      {/* Vibrant Visual Legend Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 shadow-2xs">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-emerald-500 to-green-600 shrink-0 shadow-xs" />
          <div>
            <span className="font-bold text-[#16A34A] block">GREEN • Equilibrium (Shift &lt; +5%)</span>
            <span className="text-[11px] text-[#64748B]">Stable fare bands; healthy capacity inventory</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-amber-200 shadow-2xs">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-amber-400 to-yellow-500 shrink-0 shadow-xs" />
          <div>
            <span className="font-bold text-[#D97706] block">YELLOW • Moderate Surge (+5% to +15%)</span>
            <span className="text-[11px] text-[#64748B]">Tightening load factors; algorithmic yield rise</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-rose-200 shadow-2xs">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-rose-500 to-red-600 shrink-0 shadow-xs" />
          <div>
            <span className="font-bold text-[#DC2626] block">RED • Critical Anomaly (&gt; +15%)</span>
            <span className="text-[11px] text-[#64748B]">Severe price spike; slot consolidation constraint</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE HEATMAP MATRIX */}
      {viewMode === 'matrix' ? (
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: Math.max(640, 130 + destinations.length * 92) }}>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2.5 text-xs font-bold text-[#64748B] text-left">Origin \ Dest</th>
                  {destinations.map(h => (
                    <th key={h} className="p-2.5 text-xs font-black font-heading text-[#172033] tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {origins.map((origin) => (
                  <tr key={origin} className="border-t border-[#E2E8F0]/80">
                    <td className="p-2.5 text-xs font-black font-heading text-[#172033] text-left bg-[#F8FAFC] rounded-l-xl">
                      {origin}
                    </td>
                    {destinations.map((dest) => {
                      const cell = getMatrixCell(origin, dest);
                      if (origin === dest) {
                        return (
                          <td key={dest} className="p-1.5">
                            <div className="w-full h-12 rounded-xl bg-[#F1F5F9] border border-dashed border-[#CBD5E1] flex items-center justify-center text-[10px] text-[#94A3B8] font-mono">
                              -
                            </div>
                          </td>
                        );
                      }
                      if (!cell) {
                        return (
                          <td key={dest} className="p-1.5">
                            <div className="w-full h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[10px] text-[#94A3B8]">
                              N/A
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={dest} className="p-1.5">
                          <div
                            onMouseEnter={() => setHoveredCell({
                              origin: cell.origin,
                              dest: cell.dest,
                              fare: cell.fare,
                              change: cell.change,
                              index: cell.indexScore,
                              status: cell.status,
                              scrapedSources: cell.scrapedSources
                            })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-full h-12 rounded-xl border p-1.5 flex flex-col justify-center items-center cursor-pointer transition-all duration-150 shadow-xs ${getHeatBg(cell.status)}`}
                          >
                            <span className="text-[11px] leading-none font-bold">
                              {formatINR(cell.fare)}
                            </span>
                            <span className="text-[9px] font-mono mt-0.5 opacity-90">
                              {formatDelta(cell.change)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hovered Cell Detail Strip */}
          {hoveredCell && (
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-[#CBD5E1] shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#172033] text-sm">
                  {hoveredCell.origin} ➔ {hoveredCell.dest}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  hoveredCell.status === 'red'
                    ? 'bg-rose-100 text-[#DC2626]'
                    : hoveredCell.status === 'yellow'
                    ? 'bg-amber-100 text-[#D97706]'
                    : 'bg-emerald-100 text-[#16A34A]'
                }`}>
                  {hoveredCell.status === 'red' ? 'Critical Spike' : hoveredCell.status === 'yellow' ? 'Moderate Surge' : 'Equilibrium'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span>Current Fare: <strong className="text-[#172033]">{formatINR(hoveredCell.fare)}</strong></span>
                <span>Shift: <strong className={hoveredCell.change >= 10 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{formatDelta(hoveredCell.change)}</strong></span>
                <span>Index Score: <strong className="text-[#1769AA]">{hoveredCell.index}</strong></span>
                <span className="text-[#64748B]">Scraped Sources: {hoveredCell.scrapedSources}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: VIBRANT SECTOR CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTOR_HEATMAP_DATA.map((item) => {
            const isRed = item.changePercent >= 15;
            const isYellow = item.changePercent >= 5 && item.changePercent < 15;
            const isGreen = item.changePercent < 5;

            return (
              <div
                key={item.sector}
                className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 hover:shadow-md ${
                  isRed
                    ? 'bg-gradient-to-b from-rose-50/80 to-white border-rose-200 hover:border-rose-400'
                    : isYellow
                    ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-200 hover:border-amber-400'
                    : 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-200 hover:border-emerald-400'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-heading text-[#172033] uppercase tracking-wider">
                    {item.sector}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isRed
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : isYellow
                      ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-xs'
                      : 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-[#64748B]">
                  {item.label} • {item.routePairs} routes
                </div>

                {/* Primary Metric */}
                <div className="pt-2 pb-3 border-y border-[#E2E8F0]/70 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">Average Fare</div>
                    <div className="text-2xl font-black font-heading text-[#172033]">
                      {formatINR(item.avgFare)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">Index Score</div>
                    <div className={`text-base font-black ${isRed ? 'text-[#DC2626]' : isYellow ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                      {item.indexScore} ({formatDelta(item.changePercent)})
                    </div>
                  </div>
                </div>

                {/* Key Corridors & Volatility */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#64748B]">
                    <span>Volatility:</span>
                    <strong className="text-[#172033]">{item.volatility}/100</strong>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.keyRoutes.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-[#CBD5E1] text-[#1769AA] shadow-2xs"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
