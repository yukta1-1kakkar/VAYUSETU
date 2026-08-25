import React, { useState } from 'react';
import { FLIGHT_ROUTES, LIVE_TELEMETRY_FEED } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { soundFx } from '../../utils/sound';
import { AlertTriangle, TrendingUp, ShieldAlert, Cpu, Activity, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';

export const Part4_AnomalyEngine: React.FC<{
  onSelectRoute: (routeId: string) => void;
}> = ({ onSelectRoute }) => {
  const anomalies = FLIGHT_ROUTES.filter((r) => r.isAnomaly);
  const [selectedAnomaly, setSelectedAnomaly] = useState(anomalies[0]);

  return (
    <section id="part4-anomaly" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>PART 04 // ACTIVE YIELD ANOMALY DIAGNOSTIC ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Algorithmic Anomaly Detection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Automated Z-score outlier detection identifying capacity distortions and sudden fare spikes across trunk pairs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="font-bold">{anomalies.length} ACTIVE TRUNK ANOMALIES DETECTED</span>
        </div>
      </div>

      {/* Main Grid: Active Anomaly Cards (Left) + Root-Cause Deep Dive (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Anomaly List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            STATISTICAL CORRIDOR OUTLIERS
          </span>

          {anomalies.map((route) => {
            const isSelected = selectedAnomaly.id === route.id;
            return (
              <div
                key={route.id}
                onClick={() => {
                  soundFx.playAlert();
                  setSelectedAnomaly(route);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'tech-panel-alert ring-2 ring-rose-500/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-base font-bold font-mono text-white flex items-center gap-2">
                      {route.id}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                        {route.anomalySeverity?.toUpperCase()}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 font-sans">
                      {route.originCity} → {route.destCity}
                    </span>
                  </div>

                  <span className="text-sm font-mono font-bold text-rose-400">
                    {formatDelta(route.changePercent)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                  <span>Current: <strong className="text-white">{formatINR(route.currentFare)}</strong></span>
                  <span>Ref: {formatINR(route.referenceFare)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Anomaly Root Cause Diagnostic Panel */}
        <div className="lg:col-span-7 tech-panel-alert p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-rose-900/40">
            <div>
              <div className="text-xs font-mono text-rose-400 uppercase flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>ROOT-CAUSE DECOMPOSITION // {selectedAnomaly.id}</span>
              </div>
              <h3 className="text-2xl font-bold font-space text-white">
                {selectedAnomaly.originCity} to {selectedAnomaly.destCity}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-rose-400">
                {formatDelta(selectedAnomaly.changePercent)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                DEVIATION FROM BASELINE
              </span>
            </div>
          </div>

          {/* Diagnostic Reason Text */}
          <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs sm:text-sm font-mono leading-relaxed">
            <span className="font-bold text-rose-300 block mb-1">DIAGNOSTIC SUMMARY:</span>
            {selectedAnomaly.anomalyReason}
          </div>

          {/* Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">CURRENT FARE</span>
              <span className="text-lg font-bold text-white">{formatINR(selectedAnomaly.currentFare)}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">REFERENCE FARE</span>
              <span className="text-lg font-bold text-slate-400">{formatINR(selectedAnomaly.referenceFare)}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">VOLATILITY</span>
              <span className="text-lg font-bold text-rose-400">{selectedAnomaly.volatilityIndex}/100</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">CARRIER DOMINANCE</span>
              <span className="text-xs font-bold text-indigo-300 truncate block mt-1">{selectedAnomaly.dominantCarrier}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectRoute(selectedAnomaly.id);
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>OPEN 30-DAY HISTORICAL VOLATILITY ENVELOPE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
