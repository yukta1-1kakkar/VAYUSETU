import React, { useState } from 'react';
import { FLIGHT_ROUTES, INDEX_TIMELINE, ROUTE_WEIGHTS_DATA } from '../mock/airfareData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Layers, Calendar, ArrowUpRight, CheckCircle2, Cpu, Compass, X, Calculator, Database, ShieldCheck } from 'lucide-react';
import { filterByChartRange, formatINR, formatDelta, formatMonthYearLabel, type ChartTimeRange } from '../utils/geo';

export const ApixPage: React.FC = () => {
  const [filter, setFilter] = useState<ChartTimeRange>('1M');
  const [formulationOpen, setFormulationOpen] = useState(false);
  const [showAllLedgerPeriods, setShowAllLedgerPeriods] = useState(false);

  const filteredData = React.useMemo(() => filterByChartRange(INDEX_TIMELINE, filter), [filter]);

  const currentPoint = INDEX_TIMELINE[INDEX_TIMELINE.length - 1];
  const previousPoint = INDEX_TIMELINE[INDEX_TIMELINE.length - 2] ?? currentPoint;
  const dodGrowth = (currentPoint.indexValue - previousPoint.indexValue) / previousPoint.indexValue * 100;
  const observedMeanFare = Math.round(FLIGHT_ROUTES.reduce((sum, route) => sum + route.currentFare, 0) / FLIGHT_ROUTES.length);
  const monitoredAirlines = new Set(FLIGHT_ROUTES.map((route) => route.primaryAirline)).size;
  const ledgerPeriodCount = Math.min(24, INDEX_TIMELINE.length);
  const ledgerRows = INDEX_TIMELINE
    .slice(-(showAllLedgerPeriods ? ledgerPeriodCount : 8))
    .reverse();

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1769AA] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
            <span>SOVEREIGN BENCHMARK SERIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#172033] tracking-tight">
            APIx - Airfare Price Index ({currentPoint.date})
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            A high-frequency aviation price index weighted by DGCA passenger traffic across 24 representative domestic corridors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormulationOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#1769AA] transition-colors hover:bg-blue-100/70"
        >
            <Compass className="w-4 h-4 text-[#1769AA]" />
            <span>Formulation Info</span>
        </button>
      </div>

      {formulationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setFormulationOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="apix-formulation-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#CBD5E1] bg-[#F8FAFC] shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E2E8F0] bg-white px-5 py-4 sm:px-7">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><Calculator className="h-4 w-4" /> Statistical methodology</div>
                <h2 id="apix-formulation-title" className="font-heading text-2xl font-extrabold text-[#172033]">How VAYUSETU calculates APIx</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">Fixed-base modified Laspeyres APIx with geometric matched-cohort relatives and base expenditure weights.</p>
              </div>
              <button type="button" onClick={() => setFormulationOpen(false)} aria-label="Close formulation information" className="rounded-xl border border-[#E2E8F0] bg-white p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#172033]"><X className="h-5 w-5" /></button>
            </header>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Primary weighted score</div>
                <div className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-lg font-extrabold text-[#172033] sm:text-xl">
                  APIx(t,d) = 100 × Σ[r ∈ M(t)] W̃(r,0) × R(r,t,d)
                </div>
                <p className="mt-3 text-sm leading-6 text-[#475569]">For target date <strong>t</strong> and advance-purchase window <strong>d</strong>, APIx combines matched route movements using fixed-base expenditure weights. The base period equals 100.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { step: '01', title: 'DGCA base quantity', formula: 'q(r,0) = Passengers(r) / Σ[k] Passengers(k)', note: 'DGCA passenger share supplies the route-level base quantity for the representative basket.' },
                  { step: '02', title: 'Base expenditure weight', formula: 'W(r,0) = q(r,0) × p(r,0) / Σ[k] q(k,0) × p(k,0)', note: 'Multiplying passenger share by the base representative fare produces an expenditure share, as required for Laspeyres aggregation.' },
                  { step: '03', title: 'Matched cohort relative', formula: 'R(r,t,d) = [Π[c] p(r,c,t,d) / p(r,c,0,d)] ^ (1 / |C(r,t)|)', note: 'The geometric mean combines only airline/source cohorts present in both periods and reduces distortion from extreme relatives.' },
                  { step: '04', title: 'Available expenditure weight', formula: 'W̃(r,0) = q(r,0) × p(r,0) / Σ[k ∈ M(t)] q(k,0) × p(k,0)', note: 'Base expenditure weights are renormalized only when routes lack a valid matched price relative. Coverage remains visible.' },
                  { step: '05', title: 'Modified Laspeyres APIx', formula: 'APIx(t,d) = 100 × Σ[r ∈ M(t)] W̃(r,0) × R(r,t,d)', note: 'The upper-level arithmetic aggregation measures the price change of the fixed-base expenditure basket.' },
                  { step: '06', title: 'Change measures', formula: 'Change from base (%) = APIx(t,d) − 100', note: 'The base period is exactly 100. Period-on-period change is [(APIx(t) / APIx(t−1)) − 1] × 100.' },
                ].map((item) => (
                  <article key={item.step} className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769AA] text-[10px] font-extrabold text-white">{item.step}</span><h3 className="font-heading text-sm font-bold text-[#172033]">{item.title}</h3></div>
                    <div className="mt-3 overflow-x-auto rounded-xl bg-[#F1F5F9] px-3 py-2.5 whitespace-nowrap font-mono text-xs font-bold text-[#1769AA]">{item.formula}</div>
                    <p className="mt-2 text-xs leading-5 text-[#64748B]">{item.note}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-center gap-2 font-heading text-sm font-bold text-[#172033]"><ShieldCheck className="h-4 w-4 text-[#16A34A]" /> Inclusion rules</div>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-[#64748B]">
                    <li>• Uses the top 24 positively weighted city pairs.</li>
                    <li>• Includes only records marked clean with a valid fare.</li>
                    <li>• Holds the advance-purchase window constant; the default APIx series uses T+7.</li>
                    <li>• Requires the same route, airline and source cohort in base and target periods.</li>
                    <li>• Excludes unknown, unweighted and unmatched routes from that period's calculation.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-center gap-2 font-heading text-sm font-bold text-[#172033]"><Database className="h-4 w-4 text-[#1769AA]" /> Coverage and interpretation</div>
                  <div className="mt-3 rounded-xl bg-[#F8FAFC] px-3 py-2.5 font-mono text-xs font-bold text-[#1769AA]">Coverage (%) = 100 × Σ[r ∈ M(t)] w(r)</div>
                  <p className="mt-2 text-xs leading-5 text-[#64748B]">Coverage reports the original passenger-weight share represented by matched routes before renormalization. A positive change means the weighted matched airfare basket increased relative to the selected reference period; a negative change means it decreased.</p>
                  <p className="mt-2 text-xs leading-5 text-[#64748B]"><strong className="text-[#172033]">First reference period:</strong> the earliest persisted date with enough clean, matched observations for the selected lead-time window.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Current APIx Benchmark</div>
          <div className="text-4xl font-extrabold font-heading text-[#172033] mt-1">
            {currentPoint.indexValue}
          </div>
          <div className="text-xs font-bold text-[#DC2626] mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {formatDelta(dodGrowth)} Day-over-Day
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Routes in Calculation</div>
          <div className="text-4xl font-extrabold font-heading text-[#172033] mt-1">
            {ROUTE_WEIGHTS_DATA.length}
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            Routes with clean persisted quotes
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">Daily Tariffs Sampled</div>
          <div className="text-4xl font-extrabold font-heading text-[#1769AA] mt-1">
            {currentPoint.observations.toLocaleString()}
          </div>
          <div className="text-xs text-[#16A34A] font-semibold mt-1">
            {monitoredAirlines} observed airlines
          </div>
        </div>

        <div className="intel-card p-5">
          <div className="text-xs font-semibold text-[#64748B] uppercase">National Median Tariff</div>
          <div className="text-4xl font-extrabold font-heading text-[#0F8B8D] mt-1">
            {formatINR(observedMeanFare)}
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            Across {FLIGHT_ROUTES.length} routes with clean data
          </div>
        </div>
      </div>

      {/* Large Historical APIx Graph */}
      <div className="intel-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-xl font-bold font-heading text-[#172033]">
              APIx Historical Index Trajectory
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Persisted daily score series; percentage movement is measured from the first valid calculated observation.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            {(['1W', '1M', '3M', '1Y', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === t
                    ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {t === 'ALL' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="apixPageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1769AA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1769AA" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={formatMonthYearLabel} tickLine={false} />
              <YAxis domain={[95, 'auto']} stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs space-y-1.5 min-w-[180px]">
                        <div className="font-bold text-[#172033] border-b border-[#F1F5F9] pb-1">{formatMonthYearLabel(String(label))}</div>
                        <div className="flex justify-between items-center text-[#1769AA]">
                          <span>APIx Index:</span>
                          <span className="font-bold text-sm">{data.indexValue}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B]">
                          <span>DoD change:</span>
                          <span className={`font-semibold ${data.monthlyChange >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                            {data.monthlyChange >= 0 ? `+${data.monthlyChange}%` : `${data.monthlyChange}%`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8] pt-1">
                          <span>Observations:</span>
                          <span>{data.observations?.toLocaleString()} quotes</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="indexValue" stroke="#1769AA" strokeWidth={3} fill="url(#apixPageGradient)" name="APIx" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Change Table & Route Basket Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Breakdown Table */}
        <div className="lg:col-span-6 intel-card p-6 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Recent Persisted Performance Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5">Period</th>
                  <th className="py-2.5">APIx Value</th>
                  <th className="py-2.5">DoD Shift</th>
                  <th className="py-2.5">Daily Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {ledgerRows.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 font-bold text-[#172033]">{pt.date}</td>
                    <td className="py-2.5 font-extrabold text-[#1769AA]">{pt.indexValue}</td>
                    <td className="py-2.5 font-semibold">
                      <span className={pt.monthlyChange >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                        {pt.monthlyChange >= 0 ? `+${pt.monthlyChange}%` : `${pt.monthlyChange}%`}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#64748B] font-mono">
                      {pt.observations.toLocaleString()} quotes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ledgerPeriodCount > 8 && (
            <div className="flex justify-center border-t border-[#E2E8F0] pt-4">
              <button
                type="button"
                onClick={() => setShowAllLedgerPeriods((current) => !current)}
                className="rounded-xl border border-[#BFD4E8] bg-white px-4 py-2 text-xs font-extrabold text-[#1769AA] transition-colors hover:bg-blue-50"
              >
                {showAllLedgerPeriods ? 'Show recent 8' : `View all ${ledgerPeriodCount}`}
              </button>
            </div>
          )}
        </div>

        {/* Route Contribution Breakdown */}
        <div className="lg:col-span-6 intel-card p-6 space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#172033] pb-2 border-b border-[#E2E8F0]">
            Top Corridor Weight & Index Impact
          </h3>
          <div className="space-y-3">
            {ROUTE_WEIGHTS_DATA.slice(0, 6).map((rw) => (
              <div key={rw.routeId} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#172033] text-sm">
                    {rw.originCity} → {rw.destCity} ({rw.routeId})
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {rw.carrierShare}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#1769AA] text-sm">{rw.weight}% Weight</div>
                  <div className="text-[10px] text-[#94A3B8]">{rw.contribution} pts impact</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
