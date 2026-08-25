import React, { useState } from 'react';
import { ApixOverviewChart } from '../components/dashboard/ApixOverviewChart';
import { CpiComparisonChart } from '../components/charts/CpiComparisonChart';
import { RouteWeightsChart } from '../components/charts/RouteWeightsChart';
import { FLIGHT_ROUTES } from '../mock/airfareData';
import { formatINR, formatDelta } from '../utils/geo';
import { RouteIntelligenceModal } from '../components/command-center/RouteIntelligenceModal';
import { BarChart3, AlertTriangle, Activity, TrendingUp, ShieldCheck, Layers, ArrowUpRight, Cpu } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const sortedByVolatility = [...FLIGHT_ROUTES].sort((a, b) => b.volatilityIndex - a.volatilityIndex);
  const anomalies = FLIGHT_ROUTES.filter((r) => r.isAnomaly);

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>ADVANCED DATA INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
          Comprehensive Aviation Analytics Suite
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Multi-dimensional analytics combining APIx sovereign price index trends, CPI macroeconomic benchmarking, route basket weights, and yield anomaly detection.
        </p>
      </div>

      {/* 1. APIX TREND (Section 13) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#172033] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
          <span>01 // APIx Historical Movement & Volatility Band</span>
        </div>
        <ApixOverviewChart showFullDetails />
      </section>

      {/* 2. CPI VS APIX (Section 11 & 13) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#172033] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B8D]" />
          <span>02 // Macroeconomic CPI vs APIx Inflation Benchmark</span>
        </div>
        <CpiComparisonChart />
      </section>

      {/* 3. ROUTE WEIGHTS (Section 12 & 13) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#172033] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
          <span>03 // Route Basket Weights & Index Contribution</span>
        </div>
        <RouteWeightsChart />
      </section>

      {/* 4. ROUTE VOLATILITY & ANOMALIES (Section 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Route Volatility Ranking */}
        <div className="lg:col-span-6 intel-card p-6 sm:p-7 space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-lg font-bold font-heading text-[#172033] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1769AA]" />
              <span>Route Volatility Distribution</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Standardized 30-day volatility index based on booking window fare variance.
            </p>
          </div>

          <div className="space-y-3">
            {sortedByVolatility.slice(0, 5).map((route) => (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#1769AA] hover:bg-white transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-extrabold text-[#172033] text-sm">
                    {route.originCity} → {route.destCity} ({route.id})
                  </div>
                  <div className="text-[#64748B] text-[11px] mt-0.5">
                    Current: {formatINR(route.currentFare)} • Ref: {formatINR(route.referenceFare)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#DC2626]">
                    Vol Index: {route.volatilityIndex}/100
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {route.changePercent >= 0 ? `+${route.changePercent}%` : `${route.changePercent}%`} shift
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection Engine */}
        <div className="lg:col-span-6 intel-card p-6 sm:p-7 space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-lg font-bold font-heading text-[#172033] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <span>Statistical Anomaly Analysis</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Active yield triggers exceeding 2.85σ multi-carrier threshold.
            </p>
          </div>

          <div className="space-y-3.5">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                onClick={() => setSelectedRouteId(anom.id)}
                className="p-4 rounded-xl bg-white border border-rose-200 hover:border-rose-300 shadow-xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#172033] text-sm">
                    {anom.originCity} ({anom.origin}) ➔ {anom.destCity} ({anom.destination})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#DC2626] font-bold text-xs">
                    {formatDelta(anom.changePercent)}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {anom.anomalyReason}
                </p>
                <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                  <span className="text-[#64748B]">Severity: <strong className="text-[#DC2626] uppercase">{anom.anomalySeverity}</strong></span>
                  <span className="text-[#1769AA] font-bold text-[11px] hover:underline flex items-center gap-0.5">
                    Open Dossier ➔
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Intelligence Modal */}
      {selectedRouteId && (
        <RouteIntelligenceModal
          routeId={selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
        />
      )}
    </div>
  );
};
