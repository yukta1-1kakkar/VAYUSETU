import React from 'react';
import { Cpu, ArrowDown, Database, CheckCircle2, Sliders, Layers, Calculator, BarChart3, ShieldCheck } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Data Collection',
      icon: Database,
      desc: 'Automated high-throughput ingestion from verified carrier GDS/NDC feeds, OTA booking channels, and DGCA regulatory schedules sampling 24,000+ daily tariff records.',
      details: 'Captures base fare, dynamic yield classes, time-to-departure, and flight numbers across 0-30 day booking windows.'
    },
    {
      step: '02',
      title: 'Data Cleaning & Outlier Scrubbing',
      icon: Sliders,
      desc: 'Automated statistical filter removing test bookings, error fares, and non-standard charter anomalies exceeding the 2.85σ boundary.',
      details: 'Eliminates phantom inventory and isolates genuine commercial economy ticket prices.'
    },
    {
      step: '03',
      title: 'Data Validation',
      icon: ShieldCheck,
      desc: 'Multi-carrier inventory validation ensuring multi-point corroboration across independent reservation systems.',
      details: '91% statistical confidence threshold required before inclusion into the official index calculation basket.'
    },
    {
      step: '04',
      title: 'Normalization',
      icon: CheckCircle2,
      desc: 'Ancillary decoupling stripping variable baggage charges, seat selection fees, and meals to evaluate pure mobility price.',
      details: 'Time-decay curve smoothing applied across advance-purchase tiers (0-3d, 4-7d, 8-14d, 15-30d).'
    },
    {
      step: '05',
      title: 'Route Weighting (Passenger-KM Matrix)',
      icon: Layers,
      desc: 'Dynamic weighting based on historical seat-kilometer capacity and DGCA passenger volume distribution across 24 monitored corridors.',
      details: 'High-density trunk corridors (e.g., DEL-BOM 16.4%, DEL-BLR 13.2%) are weighted proportionately to prevent regional skew.'
    },
    {
      step: '06',
      title: 'APIx Calculation (Laspeyres-Hedonic Hybrid)',
      icon: Calculator,
      desc: 'Synthesizing normalized weighted prices against the fixed baseline (100.0 established in January 2025).',
      details: 'Formula: APIx_t = Σ (w_i × (P_{i,t} / P_{i,0})) × 100 with continuous chained quality adjustments.'
    },
    {
      step: '07',
      title: 'Analytics & Anomaly Detection',
      icon: BarChart3,
      desc: 'Real-time telemetry generation, macroeconomic CPI correlation benchmarking, and rapid yield anomaly trigger alerts for regulators and enterprises.',
      details: 'Delivers transparent sovereign airfare intelligence with confidence intervals and corridor health reports.'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>SYSTEM PIPELINE & MATHEMATICAL FOUNDATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            APIx Index Methodology & Workflow
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Transparent mathematical workflow transforming millions of raw, turbulent airline quotes into a unified sovereign price index.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#1769AA]">
          <span>LASPEYRES-HEDONIC HYBRID PIPELINE</span>
        </div>
      </div>

      {/* 7-Step Sequential Pipeline (Section 23 requirement) */}
      <div className="space-y-4">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="intel-card p-6 relative flex flex-col md:flex-row gap-6 items-start">
              {/* Step Number Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-heading font-black text-[#1769AA] text-lg">
                  {item.step}
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1769AA] md:hidden">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-heading text-[#172033]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[#172033] leading-relaxed">
                  {item.desc}
                </p>
                <div className="text-xs text-[#64748B] pt-1">
                  <span className="font-semibold text-[#1769AA]">Mathematical Note: </span>
                  {item.details}
                </div>
              </div>

              {/* Icon Desktop */}
              <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center text-[#1769AA] shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula Specification Card */}
      <div className="intel-card p-6 sm:p-8 space-y-4 bg-gradient-to-br from-white to-[#F8FAFC]">
        <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
          Sovereign Index Formulation Specification
        </h3>
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] font-mono text-xs text-[#172033] space-y-2 overflow-x-auto">
          <div className="text-[#1769AA] font-bold text-sm">
            APIx_t = [ Σ_i ( W_i × ( P_i,t / P_i,0 ) ) ] × 100
          </div>
          <div className="text-[#64748B] text-[11px] pt-2 border-t border-[#F1F5F9] space-y-1">
            <div>• <strong>W_i:</strong> Passenger-Kilometer weight of corridor i normalized across total national seat capacity.</div>
            <div>• <strong>P_i,t:</strong> Time-smoothed geometric mean fare for corridor i in period t.</div>
            <div>• <strong>P_i,0:</strong> Fixed baseline reference fare established in benchmark period (Jan 2025 = 100.0).</div>
          </div>
        </div>
      </div>
    </div>
  );
};
