import React from 'react';
import { LIVE_TELEMETRY_FEED } from '../../mock/airfareData';
import { formatINR, formatDelta } from '../../utils/geo';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Radio } from 'lucide-react';

export const TelemetryTicker: React.FC<{
  onSelectRoute?: (routeId: string) => void;
}> = ({ onSelectRoute }) => {
  return (
    <div className="w-full bg-white border-y border-[#E2E8F0] py-2 overflow-hidden select-none relative z-30 shadow-xs">
      <div className="flex items-center">
        {/* Fixed Left Live Stream Label */}
        <div className="flex items-center gap-2 px-4 bg-white border-r border-[#E2E8F0] text-xs font-bold text-[#1769AA] uppercase tracking-wider whitespace-nowrap z-10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>LIVE TELEMETRY FEED</span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="flex animate-marquee gap-8 whitespace-nowrap items-center text-xs text-[#64748B]">
          {LIVE_TELEMETRY_FEED.concat(LIVE_TELEMETRY_FEED).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => {
                if (onSelectRoute) {
                  onSelectRoute(item.origin === 'DEL' && item.dest === 'BOM' ? 'DEL-BOM' : 'DEL-CCU');
                }
              }}
              className="inline-flex items-center gap-2 px-2 hover:bg-[#F1F5F9] py-0.5 rounded-lg cursor-pointer transition-colors"
            >
              <span className="text-[#94A3B8] text-[11px] font-mono">{item.timestamp}</span>
              <span className="font-bold text-[#172033]">{item.route}</span>
              <span className="text-[#64748B] text-[11px]">{item.carrier}</span>
              <span className="text-[#1769AA] font-bold">{formatINR(item.observedFare)}</span>

              {item.changeType === 'spike' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#DC2626] bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                  <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                  {formatDelta(item.deviation)}
                </span>
              )}
              {item.changeType === 'up' && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-[#D97706] font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  {formatDelta(item.deviation)}
                </span>
              )}
              {item.changeType === 'down' && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-[#16A34A] font-semibold">
                  <TrendingDown className="w-3 h-3" />
                  {formatDelta(item.deviation)}
                </span>
              )}
              {item.changeType === 'stable' && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-[#94A3B8]">
                  <Minus className="w-3 h-3" />
                  {formatDelta(item.deviation)}
                </span>
              )}
              <span className="text-[#CBD5E1] mx-1">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
