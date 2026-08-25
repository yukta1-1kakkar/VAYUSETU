import React from 'react';
import { DATA_SOURCES } from '../../mock/airfareData';
import { Database, Server, Cpu, CheckCircle2, ShieldCheck, ArrowDown } from 'lucide-react';

export const DataFoundationArchitecture: React.FC = () => {
  return (
    <div className="tech-panel p-6 sm:p-8 rounded-3xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Server className="w-4 h-4" />
            MULTI-SOURCE INGESTION TOPOLOGY
          </div>
          <h3 className="text-2xl font-black font-syne text-white mt-1">
            Data Foundation Architecture
          </h3>
        </div>

        <div className="text-xs font-mono text-slate-400">
          ALL INGESTION NODES HEALTHY
        </div>
      </div>

      {/* 4 Ingestion Source Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DATA_SOURCES.map((source) => (
          <div
            key={source.id}
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                  {source.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {source.status}
                </span>
              </div>

              <h4 className="text-sm font-bold font-syne text-white mb-2">{source.name}</h4>
              <p className="text-xs font-sans text-slate-400 font-light leading-relaxed mb-4">
                {source.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-900 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Throughput:</span>
                <span className="text-cyan-300 font-medium">{source.throughput}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ingest Latency:</span>
                <span className="text-slate-200">{source.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Central VAYUSETU Core Processing Unit */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071326] via-[#0B1E38] to-[#071326] border border-cyan-500/40 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>VAYUSETU CORE SYNTHESIS ENGINE</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-sans font-light">
            Aggregates, normalizes, and computes the continuous National Airfare Index and real-time anomaly alerts with verified mathematical integrity.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 font-mono text-xs text-slate-400">
            <span>24,850 Daily Tariffs</span>
            <span>•</span>
            <span>48 Edge Micro-Nodes</span>
            <span>•</span>
            <span>91% Verified Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
