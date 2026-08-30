import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Database, Landmark, MapPin, TrendingUp } from 'lucide-react';
import { OFFICIAL_CPI_SERIES, OFFICIAL_CPI_SOURCE } from '../../data/officialCpi';

const chartData = OFFICIAL_CPI_SERIES.map((point, index) => {
  const previous = OFFICIAL_CPI_SERIES[index - 1];
  return {
    ...point,
    momChange: previous ? Number((((point.combined / previous.combined) - 1) * 100).toFixed(2)) : null,
  };
});

export function OfficialCpiDashboard() {
  const first = OFFICIAL_CPI_SERIES[0];
  const latest = OFFICIAL_CPI_SERIES.at(-1)!;
  const cumulativeChange = ((latest.combined / first.combined) - 1) * 100;

  const cards = [
    { label: 'Combined CPI', value: latest.combined.toFixed(2), detail: latest.month, icon: Landmark, tone: 'text-[#0F8B8D] bg-teal-50' },
    { label: 'Rural CPI', value: latest.rural.toFixed(2), detail: 'All-India Rural', icon: MapPin, tone: 'text-[#16A34A] bg-green-50' },
    { label: 'Urban CPI', value: latest.urban.toFixed(2), detail: 'All-India Urban', icon: TrendingUp, tone: 'text-[#6366F1] bg-indigo-50' },
    { label: 'Published Months', value: OFFICIAL_CPI_SERIES.length.toString(), detail: `${first.month}–${latest.month} · ${cumulativeChange >= 0 ? '+' : ''}${cumulativeChange.toFixed(2)}%`, icon: Database, tone: 'text-[#1769AA] bg-blue-50' },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="intel-card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><card.icon className="h-5 w-5" /></div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{card.label}</div>
            <div className="mt-1 font-heading text-2xl font-extrabold text-[#172033]">{card.value}</div>
            <div className="mt-1 text-xs text-[#64748B]">{card.detail}</div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="intel-card p-5 sm:p-6 xl:col-span-2">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0F8B8D]">Official index levels</div>
            <h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">All-India CPI: Combined, Rural and Urban</h2>
            <p className="mt-1 text-xs text-[#64748B]">Monthly General Index values read from the supplied MoSPI workbook.</p>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -8, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                <Tooltip formatter={(value, name) => [Number(value).toFixed(2), name]} contentStyle={{ borderRadius: 12, borderColor: '#CBD5E1', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="combined" name="Combined CPI" stroke="#0F8B8D" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rural" name="Rural CPI" stroke="#16A34A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="urban" name="Urban CPI" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="intel-card p-5 sm:p-6">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Monthly movement</div>
            <h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">Combined CPI MoM Change</h2>
            <p className="mt-1 text-xs text-[#64748B]">Percentage movement from the previous published month.</p>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(1)} margin={{ top: 10, right: 8, left: -18, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'MoM change']} contentStyle={{ borderRadius: 12, borderColor: '#CBD5E1', fontSize: 12 }} />
                <Bar dataKey="momChange" radius={[4, 4, 0, 0]}>
                  {chartData.slice(1).map((point) => <Cell key={point.period} fill={(point.momChange ?? 0) >= 0 ? '#DC2626' : '#16A34A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="intel-card p-5 sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-[#E2E8F0] pb-3 sm:flex-row sm:items-end">
          <div><h2 className="font-heading text-xl font-extrabold text-[#172033]">Official CPI Data Table</h2><p className="mt-1 text-xs text-[#64748B]">{OFFICIAL_CPI_SOURCE}</p></div>
          <span className="text-xs font-bold text-[#0F8B8D]">{OFFICIAL_CPI_SERIES.length} monthly observations</span>
        </div>
        <div className="max-h-[430px] overflow-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="sticky top-0 bg-white text-[#64748B]"><tr className="border-b border-[#E2E8F0]"><th className="py-3">Month</th><th>Combined CPI</th><th>Rural CPI</th><th>Urban CPI</th><th>MoM Change</th></tr></thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {[...chartData].reverse().map((row) => (
                <tr key={row.period} className="hover:bg-[#F8FAFC]"><td className="py-3 font-bold text-[#172033]">{row.month}</td><td className="font-extrabold text-[#0F8B8D]">{row.combined.toFixed(2)}</td><td className="text-[#16A34A]">{row.rural.toFixed(2)}</td><td className="text-[#6366F1]">{row.urban.toFixed(2)}</td><td className={`font-mono font-semibold ${(row.momChange ?? 0) >= 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{row.momChange === null ? '-' : `${row.momChange >= 0 ? '+' : ''}${row.momChange.toFixed(2)}%`}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
