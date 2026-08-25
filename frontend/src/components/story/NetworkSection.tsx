import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { AIRPORTS, FLIGHT_ROUTES } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { Radio, Activity } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const NetworkSection: React.FC<{ onSelectRoute: (id: string) => void }> = ({ onSelectRoute }) => {
  return (
    <section id="network" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="01"
        tag="THE NETWORK"
        title="India moves through the sky every minute."
        subtitle="A sprawling web of 1,400+ daily trunk frequencies generating millions of price quotes every week across disparate booking channels."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Hubs Summary */}
        <div className="tech-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-4 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> 10 PRIMARY HUBS
              </span>
              <span>MONITORED</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
              From Delhi’s high-capacity trunk routes to Bengaluru’s tech corridor and Mumbai’s financial lifeline, VAYUSETU continuously indexes real-time fare availability.
            </p>
          </div>

          <div className="space-y-2">
            {Object.values(AIRPORTS).slice(0, 4).map((apt) => (
              <div
                key={apt.code}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="font-bold text-white">{apt.code}</span>
                  <span className="text-slate-400 text-[11px] truncate">{apt.city}</span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-300 font-semibold">{formatINR(apt.avgFare)}</span>
                  <span className="text-slate-500 text-[10px] ml-1.5">avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Corridor Grid */}
        <div className="md:col-span-2 tech-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6 pb-2 border-b border-slate-800">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> HIGH-FREQUENCY TRUNK CORRIDORS
            </span>
            <span className="text-slate-400">TAP ROUTE TO INSPECT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FLIGHT_ROUTES.slice(0, 6).map((route) => {
              const isDelBom = route.id === 'DEL-BOM';
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectRoute(route.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    isDelBom
                      ? 'tech-panel-alert'
                      : 'bg-[#070D18]/90 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-syne text-white tracking-wide">
                        {route.origin} → {route.destination}
                      </span>
                      {isDelBom && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[9px] font-mono font-bold animate-pulse">
                          ANOMALY
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-mono font-bold ${route.changePercent >= 15 ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {formatDelta(route.changePercent)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline font-mono">
                    <div>
                      <div className="text-xs text-slate-400">{route.originCity} to {route.destCity}</div>
                      <div className="text-[10px] text-slate-400">{route.observationsCount} quotes sampled</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white">{formatINR(route.currentFare)}</div>
                      <div className="text-[10px] text-slate-400">Ref: {formatINR(route.referenceFare)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
