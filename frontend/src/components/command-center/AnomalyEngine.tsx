import React, { useState } from 'react';
import { FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { AlertTriangle, Flame, ShieldAlert, Cpu, Activity, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const AnomalyEngine: React.FC<{
  onSelectRoute: (id: string) => void;
}> = ({ onSelectRoute }) => {
  const anomalies = FLIGHT_ROUTES.filter((r) => r.isAnomaly);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>('DEL-BOM');

  const activeAnomaly = anomalies.find((a) => a.id === selectedAnomalyId) || anomalies[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-rose-400 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            REAL-TIME RISK & YIELD DISRUPTION
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-syne text-white tracking-tight">
            Anomaly Engine
          </h2>
        </div>

        <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{anomalies.length} ACTIVE ANOMALIES DETECTED</span>
        </div>
      </div>

      {/* Main Grid: Anomaly Selector + Deep Diagnosis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anomaly Route Feed List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase">ACTIVE ALERT CORRIDORS</div>

          {anomalies.map((ano) => (
            <div
              key={ano.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedAnomalyId(ano.id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedAnomalyId === ano.id
                  ? 'tech-panel-alert shadow-lg shadow-rose-950/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-base font-bold text-white">
                  {ano.origin} → {ano.destination}
                </span>
                <span className="text-xs font-bold text-rose-400">{formatDelta(ano.deviationPercent)}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mb-2">
                {ano.originCity} to {ano.destCity}
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>Obs: {formatINR(ano.currentFare)}</span>
                <span>Ref: {formatINR(ano.referenceFare)}</span>
              </div>
            </div>
          ))}

          {/* Normal route baseline contrast item */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>16 Trunk Routes Normal</span>
            </div>
            <span className="text-[10px]">Within ±4.5% standard corridor boundaries</span>
          </div>
        </div>

        {/* Deep Dive Diagnosis Card */}
        {activeAnomaly && (
          <div className="lg:col-span-8 tech-panel-alert p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-rose-500/30">
              <div>
                <span className="text-xs font-mono text-rose-400 font-bold tracking-widest block">
                  HIGH DEVIATION // DETAILED CORRIDOR DIAGNOSIS
                </span>
                <h3 className="text-3xl font-black font-syne text-white mt-1">
                  {activeAnomaly.originCity} → {activeAnomaly.destCity}
                </h3>
              </div>

              <button
                onClick={() => {
                  soundFx.playAlert();
                  onSelectRoute(activeAnomaly.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/80 text-rose-300 font-mono text-xs font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>OPEN FULL DOSSIER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Deviation Calculation Visual Trio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-900/60">
                <span className="text-[10px] text-slate-400 uppercase block">OBSERVED</span>
                <span className="text-3xl font-black text-rose-400">{formatINR(activeAnomaly.currentFare)}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Live spot average</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">REFERENCE</span>
                <span className="text-3xl font-black text-slate-200">{formatINR(activeAnomaly.referenceFare)}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Historical seasonal norm</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-900/60">
                <span className="text-[10px] text-slate-400 uppercase block">DEVIATION</span>
                <span className="text-3xl font-black text-rose-400">{formatDelta(activeAnomaly.deviationPercent)}</span>
                <span className="text-[10px] text-rose-300/80 mt-1 block">+3.2 Sigma deviation</span>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">IDENTIFIED ANOMALY DRIVERS:</div>
              <p className="text-sm font-sans text-slate-200 leading-relaxed font-light">
                {activeAnomaly.anomalyReason}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                <div>Slot Utilization: <span className="text-white font-bold">96.8%</span></div>
                <div>Forward Booking Vel: <span className="text-rose-400 font-bold">+42%</span></div>
                <div>Carrier Concentration: <span className="text-white font-bold">High</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
