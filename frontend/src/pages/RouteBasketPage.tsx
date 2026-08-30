import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  Map as MapIcon,
  Pencil,
  PieChart as PieChartIcon,
  Route as RouteIcon,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  INDIA_STATES_PATHS,
  INDIA_SVG_HEIGHT,
  INDIA_SVG_WIDTH,
  projectLngLatToMap,
} from '../components/india-map/mapData';
import { useAuth } from '../context/AuthContext';
import { AIRPORTS, ROUTE_WEIGHTS_DATA } from '../mock/airfareData';
import type { RouteBasketItem, RouteBasketStatus } from '../types';

type StatusFilter = 'All' | RouteBasketStatus;
type WeightSort = 'desc' | 'asc';

interface EditorState {
  mode: 'add' | 'edit';
  id?: string;
  originCode: string;
  destinationCode: string;
  weight: string;
  status: RouteBasketStatus;
}

const CHART_COLORS = ['#1769AA', '#0F8B8D', '#6366F1', '#0284C7', '#0891B2', '#2563EB', '#14B8A6', '#4F46E5', '#38BDF8', '#60A5FA', '#94A3B8'];
const EPSILON = 0.001;

function formatDate() {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
}

function StatusChip({ status }: { status: RouteBasketStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status === 'Active' ? 'border-green-200 bg-green-50 text-[#15803D]' : 'border-slate-200 bg-slate-100 text-[#64748B]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'}`} />
      {status}
    </span>
  );
}

export function RouteBasketPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'MOSPI_ADMIN';
  const basketAirports = Object.values(AIRPORTS).filter((airport) =>
    Number.isFinite(airport.lat)
    && Number.isFinite(airport.lng)
    && airport.lat >= 6
    && airport.lat <= 38
    && airport.lng >= 68
    && airport.lng <= 98
  );
  const [routes, setRoutes] = useState<RouteBasketItem[]>(() => ROUTE_WEIGHTS_DATA.map((route) => ({
    id: `basket-${route.routeId}`,
    route: route.routeId,
    originCode: route.origin,
    destinationCode: route.destination,
    originCity: route.originCity,
    destinationCity: route.destCity,
    weight: route.weight,
    status: 'Active',
    lastUpdated: formatDate(),
  })));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [weightSort, setWeightSort] = useState<WeightSort>('desc');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorError, setEditorError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RouteBasketItem | null>(null);
  const [basketUpdated, setBasketUpdated] = useState(formatDate());
  const [hoveredRoute, setHoveredRoute] = useState<RouteBasketItem | null>(null);

  const activeRoutes = useMemo(() => routes.filter((route) => route.status === 'Active'), [routes]);
  const totalWeight = useMemo(
    () => Number(activeRoutes.reduce((sum, route) => sum + route.weight, 0).toFixed(2)),
    [activeRoutes],
  );

  const displayedRoutes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return routes
      .filter((route) => {
        const matchesSearch = !query || `${route.route} ${route.originCity} ${route.destinationCity}`.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => weightSort === 'desc' ? b.weight - a.weight : a.weight - b.weight);
  }, [routes, search, statusFilter, weightSort]);

  const sortedActiveRoutes = useMemo(() => [...activeRoutes].sort((a, b) => b.weight - a.weight), [activeRoutes]);
  const topTenRoutes = sortedActiveRoutes.slice(0, 10);
  const topTenChartRoutes = topTenRoutes.map((route) => ({
    ...route,
    routeLabel: `${route.originCode}-${route.destinationCode}`,
  }));
  const donutData = useMemo(() => {
    const top = topTenRoutes.map((route) => ({ name: `${route.originCode}-${route.destinationCode}`, value: route.weight }));
    const others = Number(sortedActiveRoutes.slice(10).reduce((sum, route) => sum + route.weight, 0).toFixed(2));
    return others > 0 ? [...top, { name: 'Others', value: others }] : top;
  }, [sortedActiveRoutes, topTenRoutes]);

  const openEdit = (route: RouteBasketItem) => {
    setEditorError('');
    setEditor({ mode: 'edit', id: route.id, originCode: route.originCode, destinationCode: route.destinationCode, weight: String(route.weight), status: route.status });
  };

  const saveRoute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || !canEdit) return;
    const weight = Number(editor.weight);
    if (editor.originCode === editor.destinationCode) {
      setEditorError('Origin and destination must be different cities.');
      return;
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      setEditorError('Weight must be greater than 0%.');
      return;
    }

    const existing = editor.id ? routes.find((route) => route.id === editor.id) : undefined;
    const baseTotal = totalWeight - (existing?.status === 'Active' ? existing.weight : 0);
    const proposedTotal = baseTotal + (editor.status === 'Active' ? weight : 0);
    if (proposedTotal > 100 + EPSILON) {
      setEditorError(`Active basket weight would become ${proposedTotal.toFixed(2)}%. It cannot exceed 100%.`);
      return;
    }

    const origin = basketAirports.find((airport) => airport.code === editor.originCode);
    const destination = basketAirports.find((airport) => airport.code === editor.destinationCode);
    if (!origin || !destination) return;

    if (editor.mode === 'add') {
      const pairKey = [origin.code, destination.code].sort().join('-');
      const isDuplicate = routes.some((route) => [route.originCode, route.destinationCode].sort().join('-') === pairKey);
      if (isDuplicate) {
        setEditorError('This city pair is already present in the route basket.');
        return;
      }
      const newRoute: RouteBasketItem = {
        id: `basket-${Date.now()}`,
        route: `${origin.code}-${destination.code}`,
        originCode: origin.code,
        destinationCode: destination.code,
        originCity: origin.city,
        destinationCity: destination.city,
        weight: Number(weight.toFixed(2)),
        status: editor.status,
        lastUpdated: formatDate(),
      };
      setRoutes((current) => [newRoute, ...current]);
    } else {
      setRoutes((current) => current.map((route) => route.id === editor.id
        ? { ...route, weight: Number(weight.toFixed(2)), status: editor.status, lastUpdated: formatDate() }
        : route));
    }
    setBasketUpdated(formatDate());
    setEditor(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget || !canEdit) return;
    setRoutes((current) => current.filter((route) => route.id !== deleteTarget.id));
    setBasketUpdated(formatDate());
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col justify-between gap-5 border-b border-[#E2E8F0] pb-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><RouteIcon className="h-4 w-4" /> Index administration</div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Route Basket & Weights</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">Manage the CPI airfare city-pair basket and passenger-volume weights consumed by the APIx computation pipeline.</p>
        </div>
        {!canEdit && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-[#64748B]"><LockKeyhole className="h-4 w-4" /> NSO read-only</span>
          </div>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Total Routes', value: routes.length, detail: 'City-pair observations', icon: RouteIcon, tone: 'bg-blue-50 text-[#1769AA]' },
          { label: 'Active Routes', value: activeRoutes.length, detail: `${routes.length - activeRoutes.length} inactive`, icon: CheckCircle2, tone: 'bg-green-50 text-[#16A34A]' },
          { label: 'Last Basket Updated', value: basketUpdated, detail: 'Frontend working basket', icon: CalendarDays, tone: 'bg-teal-50 text-[#0F8B8D]' },
        ].map((card) => (
          <div key={card.label} className="intel-card p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><card.icon className="h-5 w-5" /></div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{card.label}</div>
            <div className="mt-1 font-heading text-2xl font-extrabold text-[#172033]">{card.value}</div>
            <div className="mt-1 text-xs text-[#64748B]">{card.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="intel-card p-5 sm:p-6">
          <div className="mb-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><PieChartIcon className="h-4 w-4" /> Distribution analytics</div><h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">Route Weight Distribution</h2><p className="mt-1 text-xs text-[#64748B]">Top 10 active routes, with the remainder grouped as Others.</p></div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="43%" innerRadius={72} outerRadius={116} paddingAngle={2} labelLine={false} label={({ value }) => `${Number(value).toFixed(2)}%`}>
                {donutData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie><Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Weight']} /><Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="intel-card p-5 sm:p-6">
          <div className="mb-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><BarChart3 className="h-4 w-4" /> Weight ranking</div><h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">Top Weighted Routes</h2><p className="mt-1 text-xs text-[#64748B]">The ten largest active contributions to the APIx route basket.</p></div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTenChartRoutes} layout="vertical" margin={{ left: 6, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" /><XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748B' }} /><YAxis type="category" dataKey="routeLabel" width={72} tick={{ fontSize: 10, fontWeight: 700, fill: '#334155' }} /><Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Weight']} cursor={{ fill: '#F1F5F9' }} /><Bar dataKey="weight" fill="#1769AA" radius={[0, 6, 6, 0]} barSize={18} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="intel-card p-5 sm:p-6">
        <div className="mb-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><MapIcon className="h-4 w-4" /> Geographic coverage</div><h2 className="mt-1 font-heading text-xl font-extrabold text-[#172033]">India Route Basket Map</h2><p className="mt-1 text-xs text-[#64748B]">Line thickness represents route weight. Hover a corridor to inspect its contribution.</p></div>
        <div className="relative h-[520px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <svg viewBox={`0 0 ${INDIA_SVG_WIDTH} ${INDIA_SVG_HEIGHT}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <g>{INDIA_STATES_PATHS.map((state) => <path key={state.stateCode} d={state.path} fill="#EEF5FB" stroke="#B8CADD" strokeWidth="1.2" />)}</g>
            <g>
              {routes.map((route) => {
                const origin = basketAirports.find((airport) => airport.code === route.originCode);
                const destination = basketAirports.find((airport) => airport.code === route.destinationCode);
                if (!origin || !destination) return null;
                const start = projectLngLatToMap(origin.lng, origin.lat);
                const end = projectLngLatToMap(destination.lng, destination.lat);
                const active = hoveredRoute?.id === route.id;
                return <line key={route.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={active ? '#DC2626' : '#1769AA'} strokeWidth={active ? 4 + route.weight * 0.45 : 1.2 + route.weight * 0.38} strokeOpacity={route.status === 'Active' ? (active ? 1 : 0.62) : 0.18} strokeLinecap="round" onMouseEnter={() => setHoveredRoute(route)} onMouseLeave={() => setHoveredRoute(null)} className="cursor-pointer transition-all" />;
              })}
              {basketAirports.map((airport) => {
                const point = projectLngLatToMap(airport.lng, airport.lat);
                return <g key={airport.code}><circle cx={point.x} cy={point.y} r="6" fill="#0A2540" stroke="white" strokeWidth="2" /><text x={point.x + 9} y={point.y - 8} fontSize="15" fontWeight="800" fill="#0A2540">{airport.code}</text></g>;
              })}
            </g>
          </svg>
          {hoveredRoute && <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-[#E2E8F0] bg-white/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur"><span className="font-extrabold text-[#172033]">{hoveredRoute.route}</span><span className="mx-2 text-[#CBD5E1]">|</span><span className="font-bold text-[#1769AA]">{hoveredRoute.weight.toFixed(2)}%</span></div>}
        </div>
      </section>

      <section className="intel-card overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] p-5 lg:flex-row lg:items-center sm:p-6">
          <div><h2 className="font-heading text-xl font-extrabold text-[#172033]">City-Pair Basket</h2><p className="mt-1 text-xs text-[#64748B]">Showing {displayedRoutes.length} of {routes.length} routes</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search route or city" className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#1769AA] focus:ring-3 focus:ring-blue-100 sm:w-56" /></div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs font-semibold text-[#334155] outline-none focus:border-[#1769AA]"><option>All</option><option>Active</option><option>Inactive</option></select>
            <label className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-3"><ArrowDownUp className="h-3.5 w-3.5 text-[#64748B]" /><select value={weightSort} onChange={(event) => setWeightSort(event.target.value as WeightSort)} className="bg-transparent py-2.5 text-xs font-semibold text-[#334155] outline-none"><option value="desc">Weight: High to Low</option><option value="asc">Weight: Low to High</option></select></label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]"><tr><th className="px-5 py-3.5">Route</th><th className="px-4 py-3.5">Origin City</th><th className="px-4 py-3.5">Destination City</th><th className="px-4 py-3.5">Weight (%)</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Last Updated</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {displayedRoutes.map((route) => (
                <tr key={route.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-5 py-4"><div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono font-extrabold text-[#1769AA]">{route.originCode} <span>→</span> {route.destinationCode}</div></td>
                  <td className="px-4 py-4 font-semibold text-[#334155]">{route.originCity}</td><td className="px-4 py-4 font-semibold text-[#334155]">{route.destinationCity}</td>
                  <td className="px-4 py-4"><span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 font-mono font-extrabold text-[#1769AA]">{route.weight.toFixed(2)}%</span></td>
                  <td className="px-4 py-4"><StatusChip status={route.status} /></td><td className="px-4 py-4 text-[#64748B]">{route.lastUpdated}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1.5">{canEdit ? <><button onClick={() => openEdit(route)} className="rounded-lg border border-[#E2E8F0] p-2 text-[#1769AA] hover:border-blue-200 hover:bg-blue-50" aria-label={`Edit ${route.route}`}><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => setDeleteTarget(route)} className="rounded-lg border border-[#E2E8F0] p-2 text-[#DC2626] hover:border-red-200 hover:bg-red-50" aria-label={`Delete ${route.route}`}><Trash2 className="h-3.5 w-3.5" /></button></> : <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Read only</span>}</div></td>
                </tr>
              ))}
              {displayedRoutes.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#64748B]">No routes match the current search and filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A2540]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null); }}>
          <form onSubmit={saveRoute} className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between"><div><div className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">{editor.mode === 'add' ? 'New basket corridor' : 'Update basket corridor'}</div><h2 className="mt-1 font-heading text-2xl font-extrabold text-[#172033]">{editor.mode === 'add' ? 'Add Route' : `Edit ${editor.originCode} → ${editor.destinationCode}`}</h2></div><button type="button" onClick={() => setEditor(null)} className="rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9]" aria-label="Close modal"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#334155]">Origin City<select value={editor.originCode} disabled={editor.mode === 'edit'} onChange={(event) => setEditor({ ...editor, originCode: event.target.value })} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA] disabled:opacity-60">{basketAirports.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>)}</select></label>
              <label className="text-xs font-bold text-[#334155]">Destination City<select value={editor.destinationCode} disabled={editor.mode === 'edit'} onChange={(event) => setEditor({ ...editor, destinationCode: event.target.value })} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA] disabled:opacity-60">{basketAirports.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>)}</select></label>
              <label className="text-xs font-bold text-[#334155]">Weight (%)<input type="number" min="0.01" max="100" step="0.01" value={editor.weight} onChange={(event) => setEditor({ ...editor, weight: event.target.value })} placeholder="e.g. 4.50" className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA]" /></label>
              <label className="text-xs font-bold text-[#334155]">Status<select value={editor.status} onChange={(event) => setEditor({ ...editor, status: event.target.value as RouteBasketStatus })} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA]"><option>Active</option><option>Inactive</option></select></label>
            </div>
            <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B]">Current active total: <strong className="text-[#172033]">{totalWeight.toFixed(2)}%</strong>. Active routes cannot push the basket above 100%.</div>
            {editorError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-[#B91C1C]">{editorError}</div>}
            <div className="mt-7 flex justify-end gap-2"><button type="button" onClick={() => setEditor(null)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]">Cancel</button><button type="submit" className="rounded-xl bg-[#1769AA] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#12558A]">{editor.mode === 'add' ? 'Add to Basket' : 'Save Changes'}</button></div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A2540]/55 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#DC2626]"><Trash2 className="h-7 w-7" /></div><h2 className="mt-5 font-heading text-xl font-extrabold text-[#172033]">Delete {deleteTarget.route}?</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">This removes the city pair from the working basket and may make the active total invalid.</p><div className="mt-7 flex justify-center gap-2"><button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-bold text-[#475569]">Cancel</button><button onClick={confirmDelete} className="rounded-xl bg-[#DC2626] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#B91C1C]">Delete Route</button></div></section>
        </div>
      )}
    </div>
  );
}
