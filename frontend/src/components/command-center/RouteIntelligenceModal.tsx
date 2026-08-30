import React from 'react';
import { FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta, formatCount } from '../../utils/geo';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { X, AlertTriangle, TrendingUp, CheckCircle, Clock, Plane, BarChart2, ShieldCheck, Activity } from 'lucide-react';

export const RouteIntelligenceModal: React.FC<{
  routeId: string | null;
  onClose: () => void;
  dataViewLabel?: string;
}> = ({ routeId, onClose, dataViewLabel }) => {
  if (!routeId) return null;

  const route = FLIGHT_ROUTES.find((r) => r.id === routeId) || FLIGHT_ROUTES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#CBD5E1] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1] transition-all cursor-pointer shadow-xs"
          aria-label="Close dossier"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Route Header */}
        <div className="pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-2">
            <Plane className="w-3.5 h-3.5" />
            <span>CORRIDOR INTELLIGENCE DOSSIER // {route.id}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#172033]">
                {route.originCity} ({route.origin}) → {route.destCity} ({route.destination})
              </h2>
              <div className="text-xs text-[#64748B] mt-1">
                Distance: {route.distanceKm} km • {dataViewLabel ? `Data view: ${dataViewLabel}` : `Dominant: ${route.dominantCarrier}`}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-black font-heading text-[#172033]">{formatINR(route.currentFare)}</div>
              <div
                className={`text-xs font-bold ${
                  route.changePercent >= 15 ? 'text-[#DC2626]' : 'text-[#1769AA]'
                }`}
              >
                {formatDelta(route.changePercent)} vs reference baseline
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-medium block">HISTORICAL AVG</span>
            <span className="text-lg font-extrabold text-[#172033] mt-0.5 block">{formatINR(route.historicalAvg)}</span>
            <span className="text-[10px] text-[#94A3B8]">Across five booking windows</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-medium block">MIN FARE</span>
            <span className="text-lg font-extrabold text-[#16A34A] mt-0.5 block">{formatINR(route.minFare)}</span>
            <span className="text-[10px] text-[#94A3B8]">Adv. booking bucket</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-medium block">MAX FARE</span>
            <span className="text-lg font-extrabold text-[#DC2626] mt-0.5 block">{formatINR(route.maxFare)}</span>
            <span className="text-[10px] text-[#94A3B8]">Peak churn yield</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-medium block">OBSERVATIONS</span>
            <span className="text-lg font-extrabold text-[#1769AA] mt-0.5 block">{formatCount(route.observationsCount)}</span>
            <span className="text-[10px] text-[#94A3B8]">Tariffs sampled</span>
          </div>
        </div>

        {/* 30-Day Historical Trend Chart */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-[#172033]">
              <BarChart2 className="w-3.5 h-3.5 text-[#1769AA]" />
              <span>30-DAY CORRIDOR FARE TRAJECTORY</span>
            </span>
            <span className="text-xs font-semibold text-[#1769AA]">
              Reference Baseline: {formatINR(route.referenceFare)}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={route.historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1769AA" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#1769AA" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="modalBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F8B8D" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#0F8B8D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1">
                          <div className="font-bold text-[#172033]">{label}</div>
                          <div className="text-[#1769AA] font-semibold">Fare: {formatINR(data.fare)}</div>
                          <div className="text-[#64748B]">Upper Band: {formatINR(data.upperBand)}</div>
                          <div className="text-[#64748B]">Volume: {data.volume} flights</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={route.referenceFare} stroke="#94A3B8" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="upperBand" stroke="none" fill="url(#modalBand)" />
                <Area type="monotone" dataKey="fare" stroke="#1769AA" strokeWidth={2.5} fill="url(#modalGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Diagnosis or Normal Status Banner */}
        {route.isAnomaly ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">
                STATISTICAL ANOMALY DETECTED // SEVERITY: {route.anomalySeverity?.toUpperCase()}
              </div>
              <p className="text-xs text-[#172033] mt-1 leading-relaxed">
                {route.anomalyReason}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#16A34A] uppercase tracking-wide">
                EQUILIBRIUM CORRIDOR STABILITY
              </div>
              <p className="text-xs text-[#172033] mt-0.5">
                Current pricing is tracking within the ±1.5σ historical seasonal boundary.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
