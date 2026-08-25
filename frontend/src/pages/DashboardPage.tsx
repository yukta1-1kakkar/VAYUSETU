import React, { useState } from 'react';
import { KpaiSection } from '../components/dashboard/KpaiSection';
import { ApixOverviewChart } from '../components/dashboard/ApixOverviewChart';
import { IndiaMap } from '../components/india-map/IndiaMap';
import { FLIGHT_ROUTES } from '../mock/airfareData';
import { formatINR, formatDelta } from '../utils/geo';
import { RouteIntelligenceModal } from '../components/command-center/RouteIntelligenceModal';
import { TrendingUp, AlertTriangle, ArrowRight, Activity, ShieldCheck, Zap, Layers, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const topRoutes = FLIGHT_ROUTES.slice(0, 6);
  const anomalies = FLIGHT_ROUTES.filter((r) => r.isAnomaly);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
            <span>SOVEREIGN INTELLIGENCE DASHBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            National Aviation Fare Intelligence Console
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time price telemetry, sovereign airfare index benchmarks, and structural route volatility across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analytics"
            className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1769AA] text-xs font-bold text-[#172033] flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Full Analytics Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/index"
            className="px-4 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558A] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>APIx Deep Dive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. DASHBOARD KPAIs */}
      <KpaiSection />

      {/* 3. APIX SUMMARY & INTERACTIVE GRAPH */}
      <ApixOverviewChart />

      {/* 4. SHARED AUTHENTIC INDIA MAP + ROUTE DETAILS PANEL */}
      <IndiaMap onSelectRoute={(id) => setSelectedRouteId(id)} />

      {/* 5. ROUTE INSIGHTS & ANOMALIES (Section 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top High-Frequency Trunk Corridors */}
        <div className="lg:col-span-8 intel-card p-6 sm:p-7 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-lg font-bold font-heading text-[#172033] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1769AA]" />
                <span>Primary Trunk Corridors</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                High-capacity routes sampled continuously across verified airline yield classes.
              </p>
            </div>
            <Link
              to="/routes"
              className="text-xs font-semibold text-[#1769AA] hover:underline flex items-center gap-1"
            >
              <span>View All 24 Pairs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {topRoutes.map((route) => {
              const isAnomaly = route.isAnomaly;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isAnomaly
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#1769AA] hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#172033] text-sm">
                        {route.originCity} → {route.destCity}
                      </span>
                      {isAnomaly && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-[#DC2626] border border-rose-200 uppercase">
                          Anomaly
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${route.changePercent >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'}`}>
                      {formatDelta(route.changePercent)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <div className="text-[#64748B]">
                      <div>{route.dominantCarrier}</div>
                      <div className="text-[10px] text-[#94A3B8]">{route.observationsCount} quotes sampled</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-[#172033]">{formatINR(route.currentFare)}</div>
                      <div className="text-[10px] text-[#94A3B8]">Ref: {formatINR(route.referenceFare)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Key Anomaly & Volatility Triggers */}
        <div className="lg:col-span-4 intel-card p-6 sm:p-7 space-y-5">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-lg font-bold font-heading text-[#172033] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <span>Active Yield Alerts</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Statistical price deviations exceeding 2.8σ threshold.
            </p>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                onClick={() => setSelectedRouteId(anom.id)}
                className="p-4 rounded-xl bg-white border border-rose-200 hover:border-rose-300 shadow-xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="font-extrabold text-[#172033] text-sm">
                    {anom.origin} → {anom.destination}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#DC2626] font-bold text-xs">
                    {formatDelta(anom.changePercent)}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {anom.anomalyReason}
                </p>
                <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                  <span className="text-[#64748B]">Current: <strong className="text-[#172033]">{formatINR(anom.currentFare)}</strong></span>
                  <span className="text-[#1769AA] font-bold text-[11px] flex items-center gap-0.5 hover:underline">
                    Inspect Corridor ➔
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Quality Note */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
            <div>
              <div className="font-semibold text-[#172033]">91% Data Confidence</div>
              <div className="text-[#64748B] text-[11px]">Multi-carrier automated verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Route Intelligence Modal */}
      {selectedRouteId && (
        <RouteIntelligenceModal
          routeId={selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
        />
      )}
    </div>
  );
};
