import React from 'react';
import { DATA_QUALITY } from '../mock/airfareData';
import { ShieldCheck, CheckCircle2, Clock, Activity, RefreshCw, Database, Filter, Server, Check } from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const qualityMetrics = [
    {
      title: 'Geographic Coverage',
      score: DATA_QUALITY.coverage,
      description: '84 Tier-1 & Tier-2 monitored city pairs covering >88% of domestic passenger traffic.',
      status: 'Optimal'
    },
    {
      title: 'Tariff Completeness',
      score: DATA_QUALITY.completeness,
      description: 'Continuous sampling across 0-30 day advance booking windows and dynamic fare classes.',
      status: 'High'
    },
    {
      title: 'Feed Freshness',
      score: DATA_QUALITY.freshness,
      description: 'Sub-15 minute cache invalidation and live NDC API inventory synchronization.',
      status: 'Real-time'
    },
    {
      title: 'Cross-Carrier Consistency',
      score: DATA_QUALITY.consistency,
      description: 'Standardized seat class parity, baggage inclusion normalization, and tax decoupling.',
      status: 'Verified'
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DATA TRUST & GOVERNANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            Data Quality & Confidence Telemetry
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Empirical validation metrics, automated outlier scrubbing algorithms, and feed integrity verification for the APIx index.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>LAST SYNC: {DATA_QUALITY.lastSyncTimestamp}</span>
        </div>
      </div>

      {/* Primary Scorecard Banner */}
      <div className="intel-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="w-32 h-32 rounded-full border-8 border-[#1769AA]/15 border-t-[#1769AA] flex items-center justify-center my-2 shadow-xs">
            <span className="text-4xl font-black font-heading text-[#172033]">
              {DATA_QUALITY.overallConfidence}%
            </span>
          </div>
          <div className="font-extrabold text-[#172033] text-sm mt-2">Overall Data Confidence Score</div>
          <div className="text-xs text-[#64748B] mt-0.5">Empirically validated multi-point audit</div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B] font-medium uppercase">Daily Fare Quotes Sampled</div>
            <div className="text-2xl font-extrabold text-[#1769AA] mt-1">
              {DATA_QUALITY.totalDailyScrapes.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold mt-0.5">Automated pipeline ingestion</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B] font-medium uppercase">Verified Airline Carriers</div>
            <div className="text-2xl font-extrabold text-[#172033] mt-1">
              {DATA_QUALITY.verifiedCarriers} Airlines
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">IndiGo, Air India, Akasa, SpiceJet, etc.</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B] font-medium uppercase">Active Monitoring Ingestion Nodes</div>
            <div className="text-2xl font-extrabold text-[#0F8B8D] mt-1">
              {DATA_QUALITY.activeMonitoringNodes} Nodes
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Distributed geographical scraping</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B] font-medium uppercase">Outlier Scrubbing Threshold</div>
            <div className="text-2xl font-extrabold text-[#DC2626] mt-1">
              σ ≥ 2.85
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Automatic glitch & test fare rejection</div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Data Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualityMetrics.map((qm, idx) => (
          <div key={idx} className="intel-card p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#172033] text-base">{qm.title}</span>
              <span className="text-lg font-black text-[#1769AA]">{qm.score}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#1769AA] h-full rounded-full transition-all duration-1000"
                style={{ width: `${qm.score}%` }}
              />
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed pt-1">
              {qm.description}
            </p>
          </div>
        ))}
      </div>

      {/* Validation Checklist */}
      <div className="intel-card p-6 sm:p-7 space-y-4">
        <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
          Automated Pipeline Integrity Checks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#172033]">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Fare Class Normalization</div>
              <div className="text-[#64748B] text-[11px] mt-0.5">Economy standard seat class parity checked</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Ancillary Decoupling</div>
              <div className="text-[#64748B] text-[11px] mt-0.5">Seat selection & meals stripped from base fare</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Schedule Alignment</div>
              <div className="text-[#64748B] text-[11px] mt-0.5">Matched with DGCA approved flight frequencies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
