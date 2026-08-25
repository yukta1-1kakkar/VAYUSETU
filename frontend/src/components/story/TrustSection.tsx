import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { DATA_QUALITY } from '../../mock/airfareData';

export const TrustSection: React.FC = () => {
  return (
    <section id="trust" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="07"
        tag="THE FOUNDATION"
        title="Can we trust the signal?"
        subtitle="Rigorous multi-point validation across airline inventory feeds, DGCA schedules, and OTA market aggregates ensures high empirical confidence."
        gradient="cyan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-center">
        <div className="lg:col-span-5 tech-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center my-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#00f2fe"
                strokeWidth="8"
                fill="none"
                strokeDasharray="264"
                strokeDashoffset={264 * (1 - DATA_QUALITY.overallConfidence / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-5xl font-black text-white">{DATA_QUALITY.overallConfidence}%</span>
              <span className="text-[10px] text-cyan-400 tracking-widest uppercase mt-1">DATA CONFIDENCE</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 mt-2">
            AGGREGATE RELIABILITY SCORE
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 uppercase">COVERAGE</span>
              <span className="text-xl font-bold text-cyan-300">{DATA_QUALITY.coverage}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${DATA_QUALITY.coverage}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-2">84 Tier-1 & Tier-2 monitored pairs</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 uppercase">COMPLETENESS</span>
              <span className="text-xl font-bold text-emerald-300">{DATA_QUALITY.completeness}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${DATA_QUALITY.completeness}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-2">Continuous booking-window buckets</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 uppercase">FRESHNESS</span>
              <span className="text-xl font-bold text-cyan-300">{DATA_QUALITY.freshness}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${DATA_QUALITY.freshness}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-2">Sub-15 minute cache invalidation</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 uppercase">CONSISTENCY</span>
              <span className="text-xl font-bold text-purple-300">{DATA_QUALITY.consistency}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${DATA_QUALITY.consistency}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-2">Cross-carrier fare class parity</div>
          </div>
        </div>
      </div>
    </section>
  );
};
