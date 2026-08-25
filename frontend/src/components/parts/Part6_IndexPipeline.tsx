import React, { useState } from 'react';
import { Cpu, CheckCircle2, ArrowRight, ShieldCheck, Database, Filter, Calculator, FileCheck2 } from 'lucide-react';
import { soundFx } from '../../utils/sound';

interface Stage {
  id: number;
  title: string;
  name: string;
  description: string;
  formula: string;
  metrics: string;
  icon: any;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: 'STAGE 01',
    name: 'Real-Time Ingestion & Normalization',
    description: 'High-frequency extraction of published OTA inventory and NDC GDS carrier quotes across 10 major hubs and 48 monitoring nodes.',
    formula: 'Q_{raw} = \\{ f_{i,j,k,t} \\mid \\text{carrier } k, \\text{route } i \\to j, \\text{advance } t \\}',
    metrics: '24,850 observations/day | 95ms avg latency',
    icon: Database,
  },
  {
    id: 2,
    title: 'STAGE 02',
    name: 'Trunk Clustering & Distance Tiering',
    description: 'Segmentation into Metro-to-Metro trunk corridors, Tier-2 feeder links, and regional connectivity routes with distance normalization.',
    formula: 'C_r = \\sum_{k} w_k \\cdot P_{r,k} \\quad \\text{where } \\sum w_k = 1',
    metrics: '10 Core Trunk Pairs | 3 Tier Categories',
    icon: Filter,
  },
  {
    id: 3,
    title: 'STAGE 03',
    name: '3-Sigma Outlier Winsorization',
    description: 'Automated filtering of dynamic pricing glitches, test inventory fares, and non-standard charter buckets using rolling 30-day Z-scores.',
    formula: 'Z = \\frac{P_{obs} - \\mu_{30d}}{\\sigma_{30d}} > 3.0 \\implies \\text{Winsorize to } P_{99}',
    metrics: '99.4% signal retention | 0.6% anomaly tag',
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: 'STAGE 04',
    name: 'Fisher Ideal Index Synthesis',
    description: 'Computing geometric mean of Laspeyres and Paasche aggregations to eliminate passenger load factor substitution bias.',
    formula: 'I_F = \\sqrt{ \\frac{\\sum P_t Q_0}{\\sum P_0 Q_0} \\times \\frac{\\sum P_t Q_t}{\\sum P_0 Q_t} } \\times 100',
    metrics: 'Base 100 (Jan 2025) | Monthly Chained',
    icon: Calculator,
  },
  {
    id: 5,
    title: 'STAGE 05',
    name: 'Sovereign Verification & Publication',
    description: 'Final publication of sovereign index quote with harmonic cross-validation scores and integration into DGCA / MoSPI macro models.',
    formula: '\\text{Published Index} = 113.6 \\pm 2.0 \\text{ (95\\% CI)}',
    metrics: '91% Total Confidence | Real-Time Sync',
    icon: FileCheck2,
  },
];

export const Part6_IndexPipeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const currentStage = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  return (
    <section id="part6-pipeline" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 06 // 5-STAGE INDEX CONSTRUCTION PIPELINE & METHODOLOGY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Scientific Index Construction Methodology
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            End-to-end mathematical methodology transforming 24.8K daily raw flight quotes into sovereign economic intelligence.
          </p>
        </div>
      </div>

      {/* 5-Stage Stepper Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {STAGES.map((s) => {
          const isActive = s.id === activeStage;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => {
                soundFx.playClick();
                setActiveStage(s.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400">{s.title}</span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-xs font-bold truncate">{s.name}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Deep-Dive Card */}
      <div className="tech-panel p-6 sm:p-8 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase">{currentStage.title}</span>
            <h3 className="text-2xl font-bold font-space text-white mt-0.5">{currentStage.name}</h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {currentStage.metrics}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                OPERATIONAL SPECIFICATION
              </span>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {currentStage.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified under ISO-aligned statistical calculation standards</span>
            </div>
          </div>

          {/* Mathematical Formula Display */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
            <span className="text-[11px] text-indigo-400 uppercase tracking-wider block font-semibold">
              MATHEMATICAL FORMULATION
            </span>
            <div className="p-3 rounded-lg bg-slate-900/90 text-slate-200 text-xs sm:text-sm overflow-x-auto">
              <code>{currentStage.formula}</code>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Calculated on 24-hour weighted rolling execution batches.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
