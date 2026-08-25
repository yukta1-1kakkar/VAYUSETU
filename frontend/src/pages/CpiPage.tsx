import React from 'react';
import { CpiComparisonChart } from '../components/charts/CpiComparisonChart';
import { CPI_DATA_SERIES } from '../mock/airfareData';
import { BarChart3, TrendingUp, HelpCircle, ShieldCheck, ArrowRight, Layers, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CpiPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F8B8D] uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MACROECONOMIC RESEARCH LAB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            APIx vs Consumer Price Index (CPI)
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time aviation mobility inflation transmission analysis compared against official Ministry of Statistics & PI (MoSPI) indices.
          </p>
        </div>

        <Link
          to="/analytics"
          className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1769AA] text-xs font-bold text-[#172033] flex items-center gap-1.5 shadow-xs"
        >
          <span>View All Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main CPI Chart */}
      <CpiComparisonChart />

      {/* Deep Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Historical Divergence Table */}
        <div className="lg:col-span-7 intel-card p-6 sm:p-7 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Quarterly Index Divergence Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5">Period</th>
                  <th className="py-2.5">APIx Airfare</th>
                  <th className="py-2.5">CPI General</th>
                  <th className="py-2.5">CPI Transport</th>
                  <th className="py-2.5">Spread (pts)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {CPI_DATA_SERIES.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 font-bold text-[#172033]">{row.month}</td>
                    <td className="py-2.5 font-extrabold text-[#1769AA]">{row.airfareIndex}</td>
                    <td className="py-2.5 font-semibold text-[#0F8B8D]">{row.cpiGeneral}</td>
                    <td className="py-2.5 font-medium text-[#6366F1]">{row.cpiTransport}</td>
                    <td className="py-2.5 font-mono text-[#64748B] font-semibold">
                      {(row.airfareIndex - row.cpiGeneral).toFixed(1)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Economic Transmission Explanations */}
        <div className="lg:col-span-5 intel-card p-6 sm:p-7 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Methodological Insights
          </h3>

          <div className="space-y-3.5 text-xs text-[#64748B]">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="font-bold text-[#172033]">High Velocity vs Fixed Basket</div>
              <p className="leading-relaxed">
                Airfares adjust in sub-second intervals via airline yield algorithms, making APIx an early leading signal for discretionary transportation spending.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="font-bold text-[#172033]">Fuel & Capacity Transmission</div>
              <p className="leading-relaxed">
                Aviation Turbine Fuel (ATF) constitutes ~40% of airline operating costs. Spikes in crude prices translate into APIx within 7–14 days, preceding broader consumer inflation data.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="font-bold text-[#172033]">Official MoSPI Basket Reference</div>
              <p className="leading-relaxed">
                Official CPI series used: All-India General Consumer Price Index (Base 2012=100) and Transport & Communication Sub-group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
