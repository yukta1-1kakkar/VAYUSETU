import React from 'react';
import { DATA_SOURCES } from '../mock/airfareData';
import { Server, CheckCircle2, Clock, Activity, Database, FileCheck, Layers, Cpu } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>DATA FOUNDATION & INGESTION ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            Verified Ingestion Data Sources
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Multi-tiered data streams powering VayuSetu’s continuous sovereign aviation price indexing algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#1769AA]">
          <CheckCircle2 className="w-4 h-4 text-[#1769AA]" />
          <span>4 ACTIVE PIPELINE NODES</span>
        </div>
      </div>

      {/* Grid of Verified Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATA_SOURCES.map((source) => (
          <div key={source.id} className="intel-card p-6 sm:p-7 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1769AA] border border-blue-200 uppercase">
                  {source.type}
                </span>
                <h3 className="text-xl font-extrabold font-heading text-[#172033] mt-2">
                  {source.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 text-xs font-bold capitalize">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>{source.status}</span>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              {source.description}
            </p>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F1F5F9] text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-medium">Throughput</div>
                <div className="font-bold text-[#172033] mt-0.5 truncate">{source.throughput}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-medium">Records / Day</div>
                <div className="font-bold text-[#1769AA] mt-0.5">{source.recordsPerDay.toLocaleString()}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-medium">Latency</div>
                <div className="font-bold text-[#0F8B8D] mt-0.5">{source.latency}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ingestion Security & Compliance Card */}
      <div className="intel-card p-6 sm:p-7 space-y-4">
        <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
          Ingestion Architecture & Anti-Tamper Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#64748B]">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="font-bold text-[#172033]">Direct Airline NDC APIs</div>
            <p className="leading-relaxed">
              Cryptographically signed API tokens for verified inventory feeds without HTML scraping overhead.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="font-bold text-[#172033]">DGCA Schedule Matching</div>
            <p className="leading-relaxed">
              Every fare quote is cross-matched with approved Directorate General of Civil Aviation slots.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="font-bold text-[#172033]">Historical Cold Storage</div>
            <p className="leading-relaxed">
              Immutable ledger storage retaining tick-level price data for multi-year macroeconomic research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
