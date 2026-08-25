import React from 'react';
import { KPAI_METRICS } from '../../mock/airfareData';
import { Plane, GitFork, Building2, Database, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import type { KpaMetric } from '../../types';

export const KpaiSection: React.FC = () => {
  const getIcon = (type: KpaMetric['iconType']) => {
    switch (type) {
      case 'plane':
        return <Plane className="w-5 h-5 text-[#1769AA]" />;
      case 'route':
        return <GitFork className="w-5 h-5 text-[#D97706]" />;
      case 'airline':
        return <Building2 className="w-5 h-5 text-[#8B5CF6]" />;
      case 'database':
        return <Database className="w-5 h-5 text-[#0F8B8D]" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-[#16A34A]" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-[#DC2626]" />;
      default:
        return <Plane className="w-5 h-5 text-[#1769AA]" />;
    }
  };

  const getIconBg = (type: KpaMetric['iconType']) => {
    switch (type) {
      case 'plane':
        return 'bg-blue-50 border-blue-100';
      case 'route':
        return 'bg-amber-50 border-amber-100';
      case 'airline':
        return 'bg-purple-50 border-purple-100';
      case 'database':
        return 'bg-teal-50 border-teal-100';
      case 'shield':
        return 'bg-emerald-50 border-emerald-100';
      case 'alert':
        return 'bg-rose-50 border-rose-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPAI_METRICS.map((kpai) => {
          return (
            <div
              key={kpai.id}
              className="intel-card p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
            >
              {/* Header with Icon and Label */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-[#64748B] tracking-wide uppercase leading-tight">
                  {kpai.title}
                </span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(kpai.iconType)} transition-transform group-hover:scale-105`}>
                  {getIcon(kpai.iconType)}
                </div>
              </div>

              {/* Large KPI Value */}
              <div className="my-1">
                <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
                  {kpai.value}
                </div>
              </div>

              {/* Trend / Subtitle Bottom Row */}
              <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                {kpai.trend && (
                  <div className="flex items-center gap-1">
                    {kpai.trendType === 'positive' && (
                      <span className="inline-flex items-center gap-0.5 text-[#16A34A] font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {kpai.trend}
                      </span>
                    )}
                    {kpai.trendType === 'negative' && (
                      <span className="inline-flex items-center gap-0.5 text-[#DC2626] font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {kpai.trend}
                      </span>
                    )}
                    {kpai.trendType === 'alert' && (
                      <span className="inline-flex items-center gap-0.5 text-[#DC2626] font-bold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {kpai.trend}
                      </span>
                    )}
                    {kpai.trendType === 'neutral' && (
                      <span className="text-[#64748B] font-medium">
                        {kpai.trend}
                      </span>
                    )}
                  </div>
                )}
                {kpai.subtitle && (
                  <span className="text-[11px] text-[#94A3B8] font-normal truncate ml-auto">
                    {kpai.subtitle}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
