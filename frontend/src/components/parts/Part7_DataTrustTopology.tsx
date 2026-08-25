import React from 'react';
import { DATA_SOURCES, DATA_QUALITY } from '../../mock/airfareData';
import { ShieldCheck, Server, Activity, Database, CheckCircle2, Clock, Cpu, HardDrive } from 'lucide-react';

export const Part7_DataTrustTopology: React.FC = () => {
  return (
    <section id="part7-trust" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 07 // DATA FOUNDATION & MULTI-SOURCE INGESTION TOPOLOGY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Data Trust & Ingestion Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            4-tier redundant data collection pipeline cross-referencing carrier NDC APIs with regulatory DGCA filings.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OVERALL CONFIDENCE: {DATA_QUALITY.overallConfidence}%</span>
        </div>
      </div>

      {/* 4 Ingestion Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA_SOURCES.map((src) => (
          <div key={src.id} className="tech-panel p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase font-semibold">
                  {src.type} SOURCE
                </span>
                <h4 className="text-base font-bold font-space text-white mt-1.5">{src.name}</h4>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase">{src.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {src.description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">THROUGHPUT</span>
                <span className="text-slate-200 font-bold">{src.throughput}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">LATENCY</span>
                <span className="text-indigo-400 font-bold">{src.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Scores Horizontal Banner */}
      <div className="tech-panel p-6 rounded-xl space-y-4">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">
          STATISTICAL FIDELITY BREAKDOWN
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">COVERAGE</span>
            <span className="text-2xl font-bold text-white">{DATA_QUALITY.coverage}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">10 Tier-1/2 Hubs</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">COMPLETENESS</span>
            <span className="text-2xl font-bold text-white">{DATA_QUALITY.completeness}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Zero Fare Gap Policy</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">FRESHNESS</span>
            <span className="text-2xl font-bold text-emerald-400">{DATA_QUALITY.freshness}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Real-time NDC stream</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">CONSISTENCY</span>
            <span className="text-2xl font-bold text-indigo-300">{DATA_QUALITY.consistency}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Harmonic consensus</span>
          </div>
        </div>
      </div>
    </section>
  );
};
