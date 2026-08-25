import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { CPI_DATA_SERIES } from '../../mock/airfareData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export const CpiSection: React.FC = () => {
  return (
    <section id="cpi" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <SectionHeader
        sectionNumber="06"
        tag="THE ECONOMY"
        title="Connecting airfare movement with the broader economic picture."
        subtitle="Airfare is a high-velocity leading indicator of mobility inflation. Compare VNAI against the official Consumer Price Index (MoSPI CPI) to monitor real-time economic transmission."
        gradient="violet"
      />

      <div className="tech-panel p-6 rounded-2xl mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 mb-4 border-b border-slate-800 font-mono text-xs">
          <div className="text-purple-400 flex items-center gap-2 font-bold">
            <BarChart3 className="w-4 h-4" />
            AIRFARE INDEX (113.6) × CPI GENERAL (129.2)
          </div>
          <div className="text-slate-400">
            LABEL: CPI-ORIENTED ANALYTICAL COMPARISON
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CPI_DATA_SERIES} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[95, 135]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070D18',
                  border: '1px solid rgba(138,43,226,0.4)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="airfareIndex" stroke="#00f2fe" strokeWidth={3} name="Airfare Index" dot={{ r: 4, fill: '#00f2fe' }} />
              <Line type="monotone" dataKey="cpiGeneral" stroke="#c084fc" strokeWidth={2.5} strokeDasharray="4 4" name="CPI General" dot={{ r: 3, fill: '#c084fc' }} />
              <Line type="monotone" dataKey="cpiTransport" stroke="#4facfe" strokeWidth={2} name="CPI Transport" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-cyan-400" />
            <div>
              <div className="font-bold text-white">VNAI AIRFARE (113.6)</div>
              <div className="text-slate-400 text-[10px]">Fast-moving, high volatility</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-purple-400 border-b border-dashed" />
            <div>
              <div className="font-bold text-purple-300">CPI GENERAL (129.2)</div>
              <div className="text-slate-400 text-[10px]">Headline official basket</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-400" />
            <div>
              <div className="font-bold text-blue-300">CPI TRANSPORT (122.6)</div>
              <div className="text-slate-400 text-[10px]">Direct sector benchmark</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
