import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { MagneticButton } from '../common/MagneticButton';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const AnomalySection: React.FC<{ onSelectRoute: (id: string) => void }> = ({ onSelectRoute }) => {
  return (
    <section id="anomaly" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="05"
        tag="THE ANOMALY"
        title="When the market behaves differently, VayuSetu notices."
        subtitle="Airfare markets can experience abrupt asymmetric stress. When prices decouple from historical corridors, the Anomaly Engine fires high-priority telemetry alerts."
        gradient="alert"
      />

      <div className="tech-panel-alert p-6 sm:p-8 rounded-3xl relative overflow-hidden mt-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-rose-500/30">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              CRITICAL VOLATILITY TRIGGER // ANOMALY #704
            </div>
            <h3 className="text-3xl sm:text-4xl font-black font-syne text-white flex items-center gap-3">
              DEL → BOM
              <span className="text-xl sm:text-2xl font-mono text-rose-400">+38.7%</span>
            </h3>
            <p className="text-slate-300 text-sm font-light max-w-xl">
              Trunk route Delhi to Mumbai experienced rapid yield hardening over the last 96 hours, diverging +38.7% above seasonal expectation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton
              variant="alert"
              size="md"
              onClick={() => {
                soundFx.playAlert();
                onSelectRoute('DEL-BOM');
              }}
            >
              <span>OPEN ROUTE INTELLIGENCE</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/50 font-mono">
            <div className="text-slate-400 text-xs mb-1 uppercase">OBSERVED FARE</div>
            <div className="text-3xl font-black text-rose-400">₹8,950</div>
            <div className="text-[11px] text-slate-400 mt-1">Weighted 24-hr median</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
            <div className="text-slate-400 text-xs mb-1 uppercase">REFERENCE EXPECTATION</div>
            <div className="text-3xl font-black text-slate-200">₹6,450</div>
            <div className="text-[11px] text-slate-400 mt-1">Based on the five booking-window corridor norm</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/50 font-mono">
            <div className="text-slate-400 text-xs mb-1 uppercase">DEVIATION DELTA</div>
            <div className="text-3xl font-black text-rose-400">+38.7%</div>
            <div className="text-[11px] text-rose-300/80 mt-1">Exceeds 3.2σ threshold</div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>PRIMARY CAUSE: Slot consolidation & evening business demand surge</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Confidence: 94.2%</span>
        </div>
      </div>
    </section>
  );
};
