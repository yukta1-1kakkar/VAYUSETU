import React, { useState } from 'react';
import { Database, Filter, Sliders, Scale, Cpu, ChevronRight, Check } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const IndexConstructionPipeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'step-1',
      title: 'RAW OBSERVATIONS',
      icon: Database,
      value: '24,850 daily quotes',
      description: 'Continuous ingestion across 7 scheduled domestic carriers, NDC endpoints, and OTA platforms.',
      detail: 'High-frequency tariff snapshots captured at 15-minute intervals across all active city-pair buckets.',
    },
    {
      id: 'step-2',
      title: 'CLEANING & FILTERING',
      icon: Filter,
      value: 'Outlier σ ≥ 2.85 Scrubbed',
      description: 'Deduplication, dynamic surge scrubbing, and removal of erroneous single-seat glitch tariffs.',
      detail: 'Isolates genuine economy inventory and strips out promotional unbookable teaser quotes.',
    },
    {
      id: 'step-3',
      title: 'NORMALIZATION',
      icon: Sliders,
      value: 'Booking Window Curve Decay',
      description: 'Standardizes 0-3 day, 4-14 day, and 15-30 day advance purchase windows into a standardized curve.',
      detail: 'Adjusts for natural yield escalation so day-of-travel spikes do not distort structural trends.',
    },
    {
      id: 'step-4',
      title: 'ROUTE WEIGHTS',
      icon: Scale,
      value: 'Passenger-Km Share (RPK)',
      description: 'Weights each city pair by DGCA historical seat capacity and revenue passenger-kilometer density.',
      detail: 'Ensures trunk routes (e.g. DEL-BOM) carry representative economic importance vs regional hops.',
    },
    {
      id: 'step-5',
      title: 'AIRFARE INDEX (APIx)',
      icon: Cpu,
      value: 'Fixed-base Modified Laspeyres',
      description: 'Base expenditure-weighted formulation referenced to the earliest persisted observation date = 100.',
      detail: 'Uses geometric matched airline/source relatives and publishes the represented route coverage.',
    },
  ];

  return (
    <div className="tech-panel p-6 sm:p-8 rounded-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            METHODOLOGY & STATISTICAL FORMULATION
          </div>
          <h3 className="text-2xl font-black font-syne text-white mt-1">
            Index Construction Pipeline
          </h3>
        </div>

        <div className="text-xs font-mono text-slate-400">
          CLICK STEP TO INSPECT FORMULATION
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          return (
            <div
              key={step.id}
              onClick={() => {
                soundFx.playClick();
                setActiveStep(idx);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-cyan-400 text-black'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                </div>

                <div className="text-xs font-bold font-syne text-white mb-1">{step.title}</div>
                <div className="text-[11px] font-mono text-cyan-400/90">{step.value}</div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden sm:block text-center text-slate-600 mt-2 text-[10px] font-mono">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step Deep Explainer */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-cyan-300 font-bold text-sm">
            STAGE 0{activeStep + 1}: {steps[activeStep].title}
          </div>
          <p className="text-slate-300 font-sans text-xs sm:text-sm font-light">
            {steps[activeStep].description}
          </p>
          <p className="text-slate-400 text-[11px] pt-1">
            Methodology: {steps[activeStep].detail}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shrink-0">
          <Check className="w-4 h-4" />
          <span>VERIFIED ALGORITHM</span>
        </div>
      </div>
    </div>
  );
};
