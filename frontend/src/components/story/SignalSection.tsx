import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Zap } from 'lucide-react';

export const SignalSection: React.FC = () => {
  return (
    <section id="signal" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="02"
        tag="THE SIGNAL"
        title="Every route creates a signal."
        subtitle="Raw fares are noisy. Dynamic pricing, last-minute seat churn, and airline yield algorithms create turbulence. VAYUSETU extracts the true underlying economic signal."
        gradient="violet"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="tech-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs font-mono text-purple-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Zap className="w-3.5 h-3.5" /> SIGNAL REFINEMENT
            </div>
            <h4 className="text-xl font-bold font-syne text-white">
              Filtering Volatility into Economic Clarity
            </h4>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Raw airfares swing wildly from 30 days prior to departure down to the final hour. VAYUSETU applies advanced booking-window curve smoothing and passenger-kilometer weighting.
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs font-mono space-y-2">
            <div className="text-purple-300 font-bold">TELEMETRY PIPELINE STATS:</div>
            <div className="flex justify-between text-slate-400">
              <span>Sampling Velocity</span>
              <span className="text-white">24,850/day</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Outlier Scrubbing</span>
              <span className="text-white">σ ≥ 2.85 Filtered</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Signal-to-Noise Ratio</span>
              <span className="text-emerald-400">+18.4 dB</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 tech-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-3 border-b border-slate-800 mb-4">
            <span className="text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              ACTIVE OBSERVATION STREAM SAMPLES
            </span>
            <span className="text-slate-400 font-mono">LATENCY: ~85ms</span>
          </div>

          <div className="space-y-2.5">
            {[
              { route: 'DEL → BOM', carrier: 'IndiGo 6E-204', fare: '₹8,950', note: 'High Demand Surge', delta: '+38.7%', tag: 'Spike' },
              { route: 'BLR → DEL', carrier: 'Air India AI-503', fare: '₹6,120', note: 'Standard Distribution', delta: '+4.2%', tag: 'Stable' },
              { route: 'DEL → CCU', carrier: 'SpiceJet SG-816', fare: '₹7,890', note: 'Capacity Shift', delta: '+24.2%', tag: 'Warning' },
              { route: 'BOM → BLR', carrier: 'Akasa QP-1102', fare: '₹4,100', note: 'Competitive Yield', delta: '-0.5%', tag: 'Normal' },
              { route: 'DEL → HYD', carrier: 'IndiGo 6E-551', fare: '₹5,120', note: 'Trunk Baseline', delta: '+3.4%', tag: 'Normal' },
            ].map((obs, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[10px]">#{1042 + idx}</span>
                  <span className="font-bold text-white text-sm">{obs.route}</span>
                  <span className="text-slate-400 hidden sm:inline">{obs.carrier}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-[11px] hidden md:inline">{obs.note}</span>
                  <span className="font-bold text-white text-sm">{obs.fare}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      obs.tag === 'Spike'
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                        : obs.tag === 'Warning'
                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                        : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                    }`}
                  >
                    {obs.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
