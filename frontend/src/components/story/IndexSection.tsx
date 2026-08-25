import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { TrendingUp } from 'lucide-react';

export const IndexSection: React.FC = () => {
  return (
    <section id="index" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="03"
        tag="THE INDEX"
        title="Thousands of observations. One meaningful index."
        subtitle="Like the S&P 500 for equities or CPI for consumer inflation, VAYUSETU synthesizes millions of discrete seat prices into a single sovereign airfare benchmark."
        gradient="cyan"
      />

      <div className="tech-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              VAYUSETU NATIONAL AIRFARE INDEX (VNAI)
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight text-white">
                113.6
              </div>
              <div className="space-y-1 font-mono">
                <div className="text-xl sm:text-2xl font-bold text-rose-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  +4.82%
                </div>
                <div className="text-xs text-slate-400">MoM MOVEMENT</div>
              </div>
            </div>

            <p className="text-slate-300 text-base font-light leading-relaxed max-w-lg">
              Anchored at 100.0 baseline (Jan 2025), the index reveals a +13.6% net structural airfare inflation across India’s core aviation corridors.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono">
              <div className="text-slate-400 text-xs uppercase mb-1">BASE BENCHMARK</div>
              <div className="text-2xl font-black text-white">100.0</div>
              <div className="text-[10px] text-cyan-400/80 mt-1">Established Jan 2025</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono">
              <div className="text-slate-400 text-xs uppercase mb-1">CUMULATIVE SHIFT</div>
              <div className="text-2xl font-black text-rose-400">+13.6%</div>
              <div className="text-[10px] text-slate-400 mt-1">19-Month expansion</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono">
              <div className="text-slate-400 text-xs uppercase mb-1">OBSERVATIONS</div>
              <div className="text-2xl font-black text-cyan-300">24,850</div>
              <div className="text-[10px] text-slate-400 mt-1">Daily weighted quotes</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono">
              <div className="text-slate-400 text-xs uppercase mb-1">CONFIDENCE BAND</div>
              <div className="text-2xl font-black text-emerald-400">±1.98 pts</div>
              <div className="text-[10px] text-slate-400 mt-1">95% statistical CI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
