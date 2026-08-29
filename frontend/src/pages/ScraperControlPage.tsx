import { useMemo, useState } from 'react';
import {
  Activity, Bot, CalendarClock, CheckCircle2, Database, Download, FileText,
  Globe2, Info, Play, RefreshCw, Route as RouteIcon, Search, Server, ShieldCheck,
  TimerReset, Zap,
  type LucideIcon,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DATA_QUALITY, DATA_SOURCES, FLIGHT_ROUTES, INDEX_TIMELINE, ROUTE_WEIGHTS_DATA } from '../mock/airfareData';

type JobStatus = 'Success' | 'Warning' | 'Failed';
type ScraperState = 'Running' | 'Idle' | 'Failed';

interface ActivityJob {
  id: string; timestamp: Date; source: string; route: string; bookingWindow: string;
  records: number; status: JobStatus; endTime: Date; retryCount: number; error: string;
}

const SOURCE_DEFINITIONS = [
  { name: 'Air India Express', type: 'Airline' },
  { name: 'Akasa Air', type: 'Airline' },
  { name: 'SpiceJet', type: 'Airline' },
  { name: 'Yatra', type: 'OTA' },
] as const;
const SCHEDULE_HOURS = [8, 12, 16, 20] as const;
const BOOKING_WINDOWS = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'] as const;

const sourceKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function formatTimestamp(value: string | Date | undefined) {
  if (!value || value === 'No observations') return 'Not available';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function nextScheduledTime(now: Date) {
  const next = new Date(now);
  const nextHour = SCHEDULE_HOURS.find((hour) => hour > now.getHours());
  if (nextHour === undefined) next.setDate(next.getDate() + 1);
  next.setHours(nextHour ?? SCHEDULE_HOURS[0], 0, 0, 0);
  return next;
}

function formatScheduleHour(hour: number) {
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

function StatusBadge({ status }: { status: JobStatus | 'Active' | 'Warning' | 'Failed' }) {
  const style = status === 'Success' || status === 'Active' ? 'border-green-200 bg-green-50 text-green-700' : status === 'Warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700';
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${style}`}><span className={`h-1.5 w-1.5 rounded-full ${status === 'Success' || status === 'Active' ? 'bg-green-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'}`} />{status}</span>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }: { icon: LucideIcon; label: string; value: string | number; detail: string; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  const tones = { blue: 'bg-blue-50 text-[#1769AA]', green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700' };
  return <div className="intel-card p-5"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4.5 w-4.5" /></div><div className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">{label}</div><div className="mt-1 font-heading text-xl font-extrabold text-[#172033]">{value}</div><div className="mt-1 truncate text-[10px] text-[#64748B]" title={detail}>{detail}</div></div>;
}

export function ScraperControlPage() {
  const [clock] = useState(() => new Date());
  const [scraperState, setScraperState] = useState<ScraperState>('Idle');
  const [notice, setNotice] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'All' | JobStatus>('All');

  const nextRun = nextScheduledTime(clock);
  const lastSync = DATA_QUALITY.lastSyncTimestamp;
  const latestIndexDate = INDEX_TIMELINE.at(-1)?.date ?? 'Not generated';
  const monitoredSources = SOURCE_DEFINITIONS.map((definition) => {
    const live = DATA_SOURCES.find((source) => sourceKey(source.name) === sourceKey(definition.name));
    return { ...definition, records: live?.recordsPerDay ?? 0, latency: live?.latency ?? 'Not recorded', status: (live?.recordsPerDay ?? 0) > 0 ? 'Active' as const : 'Warning' as const };
  });

  const jobs = useMemo<ActivityJob[]>(() => {
    if (!FLIGHT_ROUTES.length) return [];
    return Array.from({ length: 20 }, (_, index) => {
      const route = FLIGHT_ROUTES[index % FLIGHT_ROUTES.length];
      const availableSources = route.sources?.length ? route.sources : [route.primaryAirline];
      const start = new Date(clock.getTime() - index * 7 * 60_000);
      const records = Math.max(1, Math.round(route.observationsCount / Math.max(1, availableSources.length)));
      return {
        id: `JOB-${String(index + 1).padStart(4, '0')}`,
        timestamp: start,
        endTime: new Date(start.getTime() + Math.max(12, Math.min(180, records)) * 1000),
        source: availableSources[index % availableSources.length],
        route: `${route.origin}-${route.destination}`,
        bookingWindow: BOOKING_WINDOWS[index % BOOKING_WINDOWS.length],
        records, status: 'Success', retryCount: 0, error: '',
      };
    });
  }, [clock]);

  const filteredLogs = jobs.filter((job) => {
    const query = logSearch.trim().toLowerCase();
    return (logFilter === 'All' || job.status === logFilter) && (!query || `${job.id} ${job.source} ${job.route}`.toLowerCase().includes(query));
  });
  const sourceChart = monitoredSources.map((source) => ({ name: source.name.replace('Air India Express', 'AIX'), records: source.records }));
  const jobCounts = [
    { name: 'Success', value: jobs.filter((job) => job.status === 'Success').length, color: '#16A34A' },
    { name: 'Warning', value: jobs.filter((job) => job.status === 'Warning').length, color: '#D97706' },
    { name: 'Failed', value: jobs.filter((job) => job.status === 'Failed').length, color: '#DC2626' },
  ];
  const averageDuration = jobs.length ? jobs.reduce((sum, job) => sum + (job.endTime.getTime() - job.timestamp.getTime()) / 1000, 0) / jobs.length : 0;
  const completedScheduleRuns = SCHEDULE_HOURS.filter((hour) => hour <= clock.getHours()).length;

  const simulateAction = (label: string, running = false) => {
    if (running) setScraperState('Running');
    setNotice(`${label} started. This prototype action is being simulated.`);
    window.setTimeout(() => { if (running) setScraperState('Idle'); setNotice(`${label} completed successfully.`); }, 1200);
  };

  const exportLogs = () => {
    const rows = [['Job ID', 'Source', 'Start', 'End', 'Route', 'Window', 'Status', 'Retries', 'Error'], ...jobs.map((job) => [job.id, job.source, job.timestamp.toISOString(), job.endTime.toISOString(), job.route, job.bookingWindow, job.status, String(job.retryCount), job.error])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'vayusetu-scraper-logs.csv'; anchor.click(); URL.revokeObjectURL(url);
    setNotice('Scraper logs exported as CSV.');
  };

  return <div className="space-y-7 pb-16">
    <header className="flex flex-col justify-between gap-5 border-b border-[#E2E8F0] pb-5 lg:flex-row lg:items-end">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><Server className="h-4 w-4" /> Admin · Data Operations</div><h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Scraper Control Panel</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">Operational health, ETL monitoring and controlled administration of VAYUSETU’s airfare collection engine.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => simulateAction('Run scraper now', true)} disabled={scraperState === 'Running'} className="inline-flex items-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"><Play className="h-4 w-4" /> Run Scraper Now</button><button onClick={() => simulateAction('Retry failed jobs')} className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-extrabold text-[#475569]"><RefreshCw className="h-4 w-4" /> Retry Failed</button></div>
    </header>

    {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-900"><Info className="h-4 w-4 shrink-0" />{notice}</div>}

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <MetricCard icon={Activity} label="Scraper Status" value={scraperState} detail="Collection engine state" tone={scraperState === 'Running' ? 'green' : scraperState === 'Failed' ? 'red' : 'blue'} />
      <MetricCard icon={CheckCircle2} label="Last Successful Scrape" value={formatTimestamp(lastSync).split(',')[0]} detail={formatTimestamp(lastSync)} tone="green" />
      <MetricCard icon={CalendarClock} label="Next Scheduled Scrape" value={formatTimestamp(nextRun).split(',')[1]?.trim() ?? formatTimestamp(nextRun)} detail={formatTimestamp(nextRun)} tone="blue" />
      <MetricCard icon={Globe2} label="Websites Monitored" value={SOURCE_DEFINITIONS.length} detail="3 airlines · 1 OTA" />
      <MetricCard icon={RouteIcon} label="Routes Scraped Today" value={DATA_QUALITY.activeMonitoringNodes} detail={`${DATA_QUALITY.coverage}% route basket coverage`} tone="green" />
      <MetricCard icon={Database} label="Fare Records Today" value={DATA_QUALITY.totalDailyScrapes.toLocaleString('en-IN')} detail="Clean persisted observations" tone="green" />
      <MetricCard icon={Zap} label="APIX Updated At" value={latestIndexDate} detail={`Latest generation · ${formatTimestamp(lastSync)}`} tone="blue" />
    </section>

    <section className="intel-card p-5 sm:p-6"><div className="mb-5"><div className="text-[10px] font-extrabold uppercase tracking-wider text-[#1769AA]">Source telemetry</div><h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">Active Data Sources</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{monitoredSources.map((source) => <article key={source.name} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"><div className="flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1769AA] shadow-sm">{source.type === 'Airline' ? <Bot className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}</div><StatusBadge status={source.status} /></div><h3 className="mt-4 text-sm font-extrabold text-[#172033]">{source.name}</h3><div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{source.type}</div><dl className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-3 text-[11px]"><div className="flex justify-between gap-2"><dt className="text-[#64748B]">Last scrape</dt><dd className="font-semibold text-[#334155]">{formatTimestamp(lastSync)}</dd></div><div className="flex justify-between"><dt className="text-[#64748B]">Records</dt><dd className="font-mono font-bold text-[#172033]">{source.records.toLocaleString('en-IN')}</dd></div><div className="flex justify-between"><dt className="text-[#64748B]">Avg. response</dt><dd className="font-mono font-bold text-[#172033]">{source.latency}</dd></div></dl></article>)}</div></section>

    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div className="intel-card p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 text-[#0F8B8D]" /><div><h2 className="font-heading text-xl font-extrabold text-[#172033]" title="Controls that keep automated public-web collection responsible">Ethical Scraping & Compliance</h2><p className="mt-1 text-xs text-[#64748B]">Collection controls required for approved VAYUSETU sources.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{['Publicly available airfare pages only', 'Rate limiting enabled', 'Respect robots.txt where applicable', 'Session management enabled', 'Retry mechanism enabled', 'CAPTCHA detection enabled', 'No authenticated or private user data collected'].map((policy) => <div key={policy} className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/60 p-3 text-xs font-semibold text-green-900"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />{policy}</div>)}</div></div>
      <div className="intel-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="text-[10px] font-extrabold uppercase tracking-wider text-[#1769AA]">Automated windows</div><h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">Scheduler</h2></div><CalendarClock className="h-7 w-7 text-[#1769AA]" /></div><div className="mt-5 grid grid-cols-2 gap-3">{SCHEDULE_HOURS.map((hour) => { const complete = hour <= clock.getHours(); return <div key={hour} className={`rounded-xl border p-3 ${complete ? 'border-green-200 bg-green-50' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}><div className="font-mono text-sm font-extrabold text-[#172033]">{formatScheduleHour(hour)}</div><div className={`mt-1 text-[9px] font-extrabold uppercase ${complete ? 'text-green-700' : 'text-[#94A3B8]'}`}>{complete ? 'Completed' : 'Scheduled'}</div></div>; })}</div><div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-950"><strong>Next execution:</strong> {formatTimestamp(nextRun)}<br /><span className="text-[10px] text-blue-700">{completedScheduleRuns} of {SCHEDULE_HOURS.length} scheduled windows completed today.</span></div></div></section>

    <section className="intel-card p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><Zap className="h-5 w-5 text-[#1769AA]" /><div><h2 className="font-heading text-xl font-extrabold text-[#172033]" title="Extract, Transform and Load turns raw website results into index-ready observations">ETL Pipeline Status</h2><p className="text-xs text-[#64748B]">Latest validated processing cycle</p></div></div><div className="grid gap-3 md:grid-cols-4">{[
      ['1', 'Extract', DATA_QUALITY.totalDailyScrapes, `${averageDuration.toFixed(1)}s avg`], ['2', 'Transform', Math.round(DATA_QUALITY.totalDailyScrapes * DATA_QUALITY.consistency / 100), `${DATA_QUALITY.consistency}% valid`], ['3', 'Load', DATA_QUALITY.totalDailyScrapes, 'Persisted to database'], ['4', 'APIX Generated', INDEX_TIMELINE.at(-1)?.observations ?? 0, latestIndexDate],
    ].map(([step, name, records, duration]) => <div key={name} className="relative rounded-2xl border border-green-200 bg-green-50/50 p-4"><div className="flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-[10px] font-extrabold text-white">{step}</span><CheckCircle2 className="h-4 w-4 text-green-600" /></div><h3 className="mt-3 text-sm font-extrabold text-[#172033]">{name}</h3><div className="mt-1 font-mono text-lg font-extrabold text-green-700">{records}</div><div className="text-[10px] text-[#64748B]">records · {duration}</div></div>)}</div></section>

    <section className="grid gap-6 xl:grid-cols-2"><div className="intel-card p-5 sm:p-6"><h2 className="font-heading text-lg font-extrabold text-[#172033]">Records per Website</h2><p className="mt-1 text-xs text-[#64748B]">Clean observations currently persisted by source.</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={sourceChart}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} /><YAxis tick={{ fontSize: 10, fill: '#64748B' }} /><Tooltip /><Bar dataKey="records" fill="#1769AA" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="intel-card p-5 sm:p-6"><h2 className="font-heading text-lg font-extrabold text-[#172033]">Scraper Health Metrics</h2><p className="mt-1 text-xs text-[#64748B]">Latest 20 visible activity records.</p><div className="grid gap-4 sm:grid-cols-[200px_1fr]"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={jobCounts} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78}>{jobCounts.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="flex flex-col justify-center gap-3">{jobCounts.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] px-3 py-2"><span className="flex items-center gap-2 text-xs font-semibold text-[#475569]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}<div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-blue-50 p-3"><div className="text-[9px] font-bold uppercase text-[#64748B]">Avg duration</div><div className="mt-1 font-mono text-lg font-extrabold text-[#1769AA]">{averageDuration.toFixed(1)}s</div></div><div className="rounded-xl bg-teal-50 p-3"><div className="text-[9px] font-bold uppercase text-[#64748B]">Route coverage</div><div className="mt-1 font-mono text-lg font-extrabold text-[#0F8B8D]">{DATA_QUALITY.coverage}%</div></div></div></div></div></div></section>

    <section className="intel-card overflow-hidden"><div className="border-b border-[#E2E8F0] p-5 sm:p-6"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#1769AA]" /><h2 className="font-heading text-xl font-extrabold text-[#172033]">Scraper Activity Timeline</h2></div><p className="mt-1 text-xs text-[#64748B]">Latest 20 clean collection activities derived from live route observations.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-[#F8FAFC] text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]"><tr><th className="px-5 py-3">Timestamp</th><th className="px-4 py-3">Website</th><th className="px-4 py-3">Route</th><th className="px-4 py-3" title="Days between collection and departure">Booking Window</th><th className="px-4 py-3">Records Extracted</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#EDF2F7]">{jobs.map((job) => <tr key={job.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3 text-[#64748B]">{formatTimestamp(job.timestamp)}</td><td className="px-4 py-3 font-bold text-[#334155]">{job.source}</td><td className="px-4 py-3 font-mono font-bold text-[#1769AA]">{job.route}</td><td className="px-4 py-3">{job.bookingWindow}</td><td className="px-4 py-3 font-mono">{job.records}</td><td className="px-5 py-3"><StatusBadge status={job.status} /></td></tr>)}</tbody></table></div></section>

    <section className="intel-card p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><RouteIcon className="h-5 w-5 text-[#1769AA]" /><div><h2 className="font-heading text-xl font-extrabold text-[#172033]" title="DGCA passenger-weighted representative city-pair basket">Representative Route Coverage</h2><p className="text-xs text-[#64748B]">Latest collection state for the complete configured basket.</p></div></div><div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{ROUTE_WEIGHTS_DATA.map((weight) => { const route = FLIGHT_ROUTES.find((item) => item.id === weight.routeId); return <div key={weight.routeId} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-extrabold text-[#172033]">{weight.origin}–{weight.destination}</span><StatusBadge status={route ? 'Active' : 'Warning'} /></div><div className="mt-2 flex justify-between text-[10px] text-[#64748B]"><span>{weight.weight.toFixed(2)}% basket</span><span>{route ? formatTimestamp(lastSync) : 'Awaiting scrape'}</span></div></div>; })}</div></section>

    <section className="intel-card overflow-hidden"><div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] p-5 lg:flex-row lg:items-center sm:p-6"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#1769AA]" /><div><h2 className="font-heading text-xl font-extrabold text-[#172033]">Scraper Logs</h2><p className="text-xs text-[#64748B]">Search and filter the current operational audit view.</p></div></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" /><input value={logSearch} onChange={(event) => setLogSearch(event.target.value)} placeholder="Search job, source or route" className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#1769AA] sm:w-60" /></label><select value={logFilter} onChange={(event) => setLogFilter(event.target.value as typeof logFilter)} className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs font-bold text-[#475569]"><option>All</option><option>Success</option><option>Warning</option><option>Failed</option></select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-[#F8FAFC] text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]"><tr><th className="px-5 py-3">Job ID</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Retries</th><th className="px-5 py-3">Error</th></tr></thead><tbody className="divide-y divide-[#EDF2F7]">{filteredLogs.map((job) => <tr key={job.id}><td className="px-5 py-3 font-mono font-bold text-[#1769AA]">{job.id}</td><td className="px-4 py-3 font-semibold">{job.source}</td><td className="px-4 py-3 text-[#64748B]">{formatTimestamp(job.timestamp)}</td><td className="px-4 py-3 text-[#64748B]">{formatTimestamp(job.endTime)}</td><td className="px-4 py-3"><StatusBadge status={job.status} /></td><td className="px-4 py-3 font-mono">{job.retryCount}</td><td className="px-5 py-3 text-[#64748B]">{job.error || '—'}</td></tr>)}{!filteredLogs.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-[#64748B]">No logs match the current search and filter.</td></tr>}</tbody></table></div></section>

    <section className="rounded-2xl border border-[#CBD5E1] bg-[#0A2540] p-5 text-white sm:p-6"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-sky-300"><ShieldCheck className="h-4 w-4" /> Admin controls</div><h2 className="mt-1 font-heading text-xl font-extrabold">Pipeline Operations</h2><p className="mt-1 text-xs text-slate-300">Prototype actions update this console locally and do not call production scraper infrastructure.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => simulateAction('Refresh ETL pipeline')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold"><TimerReset className="h-4 w-4" /> Refresh ETL</button><button onClick={() => simulateAction('Regenerate APIX')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold"><Zap className="h-4 w-4" /> Regenerate APIX</button><button onClick={exportLogs} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-extrabold text-[#0A2540]"><Download className="h-4 w-4" /> Export Logs</button></div></div></section>
  </div>;
}
