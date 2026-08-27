import { useMemo, useState, type FormEvent } from 'react';
import {
  Activity,
  Building2,
  Clock3,
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GOVERNMENT_USERS, USER_ROLE_PERMISSIONS } from '../mock/governmentUsers';
import type {
  AccountStatus,
  GovernmentOrganization,
  GovernmentUser,
  GovernmentUserRole,
} from '../types';

type OrganizationFilter = 'All' | GovernmentOrganization;
type StatusFilter = 'All' | AccountStatus;

interface UserEditor {
  mode: 'add' | 'edit';
  id?: string;
  name: string;
  email: string;
  organization: GovernmentOrganization;
  role: GovernmentUserRole;
  status: AccountStatus;
}

interface ActivityEntry {
  id: string;
  message: string;
  actor: string;
  timestamp: string;
  tone: 'blue' | 'green' | 'amber' | 'slate';
}

const ROLE_ORGANIZATION: Record<GovernmentUserRole, GovernmentOrganization> = {
  'MoSPI Admin': 'MoSPI',
  'NSO Official': 'NSO',
  'RBI Analyst': 'RBI',
};

const ORGANIZATION_ROLE: Record<GovernmentOrganization, GovernmentUserRole> = {
  MoSPI: 'MoSPI Admin',
  NSO: 'NSO Official',
  RBI: 'RBI Analyst',
};

const INITIAL_ACTIVITY: ActivityEntry[] = [
  { id: 'activity-1', message: 'API Consumer account disabled', actor: 'MoSPI Administrator', timestamp: '2026-08-22T15:40:00+05:30', tone: 'amber' },
  { id: 'activity-2', message: 'Data Analyst role reviewed', actor: 'MoSPI Administrator', timestamp: '2026-08-21T12:05:00+05:30', tone: 'blue' },
  { id: 'activity-3', message: 'RBI Analyst account enabled', actor: 'MoSPI Administrator', timestamp: '2026-08-18T10:32:00+05:30', tone: 'green' },
];

function formatDateTime(value: string | null) {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function RoleBadge({ role }: { role: GovernmentUserRole }) {
  const style = role === 'MoSPI Admin'
    ? 'border-blue-200 bg-blue-50 text-[#1769AA]'
    : role === 'NSO Official'
      ? 'border-green-200 bg-green-50 text-[#15803D]'
      : 'border-violet-200 bg-violet-50 text-[#6D28D9]';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${style}`}>{role}</span>;
}

function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status === 'Active' ? 'border-green-200 bg-green-50 text-[#15803D]' : 'border-slate-200 bg-slate-100 text-[#64748B]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'}`} /> {status}
    </span>
  );
}

export function UserManagementPage() {
  const { user: authenticatedUser } = useAuth();
  const canEdit = authenticatedUser?.role === 'MOSPI_ADMIN';
  const [users, setUsers] = useState<GovernmentUser[]>(GOVERNMENT_USERS);
  const [search, setSearch] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<OrganizationFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [editor, setEditor] = useState<UserEditor | null>(null);
  const [editorError, setEditorError] = useState('');
  const [toggleTarget, setToggleTarget] = useState<GovernmentUser | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);

  const activeCount = users.filter((user) => user.status === 'Active').length;
  const organizationsConnected = new Set(users.map((user) => user.organization)).size;
  const profileUser = profileId ? users.find((user) => user.id === profileId) ?? null : null;

  const displayedUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchesSearch = !query || `${user.name} ${user.email}`.toLowerCase().includes(query);
        return matchesSearch
          && (organizationFilter === 'All' || user.organization === organizationFilter)
          && (statusFilter === 'All' || user.status === statusFilter);
      });
  }, [users, search, organizationFilter, statusFilter]);

  const logActivity = (message: string, tone: ActivityEntry['tone']) => {
    setActivity((current) => [{ id: `activity-${Date.now()}`, message, actor: authenticatedUser?.name ?? 'MoSPI Admin', timestamp: new Date().toISOString(), tone }, ...current].slice(0, 6));
  };

  const openAdd = () => {
    setEditorError('');
    setEditor({ mode: 'add', name: '', email: '', organization: 'NSO', role: 'NSO Official', status: 'Active' });
  };

  const openEdit = (target: GovernmentUser) => {
    setEditorError('');
    setEditor({ mode: 'edit', id: target.id, name: target.name, email: target.email, organization: target.organization, role: target.role, status: target.status });
  };

  const saveUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || !canEdit) return;
    const name = editor.name.trim();
    const email = editor.email.trim().toLowerCase();
    if (!name) {
      setEditorError('Full name is required.');
      return;
    }
    if (!/^[^\s@]+@vayusetu\.gov\.in$/i.test(email)) {
      setEditorError('Use an authorized @vayusetu.gov.in government email address.');
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === email && user.id !== editor.id)) {
      setEditorError('A user with this email address already exists.');
      return;
    }

    const now = new Date().toISOString();
    if (editor.mode === 'add') {
      setUsers((current) => [{ id: `user-${Date.now()}`, name, email, organization: editor.organization, role: editor.role, status: editor.status, lastLogin: null, createdOn: now, lastUpdated: now }, ...current]);
      logActivity(`${name} added as ${editor.role}`, 'green');
    } else {
      const previous = users.find((user) => user.id === editor.id);
      setUsers((current) => current.map((user) => user.id === editor.id ? { ...user, name, organization: editor.organization, role: editor.role, status: editor.status, lastUpdated: now } : user));
      if (previous?.role !== editor.role) logActivity(`${name} role updated to ${editor.role}`, 'blue');
      else if (previous?.status !== editor.status) logActivity(`${name} account ${editor.status === 'Active' ? 'enabled' : 'disabled'}`, editor.status === 'Active' ? 'green' : 'amber');
      else logActivity(`${name} profile updated`, 'blue');
    }
    setEditor(null);
  };

  const confirmToggle = () => {
    if (!toggleTarget || !canEdit) return;
    const nextStatus: AccountStatus = toggleTarget.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((current) => current.map((user) => user.id === toggleTarget.id ? { ...user, status: nextStatus, lastUpdated: new Date().toISOString() } : user));
    logActivity(`${toggleTarget.name} account ${nextStatus === 'Active' ? 'enabled' : 'disabled'}`, nextStatus === 'Active' ? 'green' : 'amber');
    setToggleTarget(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col justify-between gap-5 border-b border-[#E2E8F0] pb-5 lg:flex-row lg:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]"><ShieldCheck className="h-4 w-4" /> Access administration</div><h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">User Management</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">Manage authorized government identities and institutional roles across MoSPI, NSO and RBI.</p></div>
        {canEdit ? <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-900/10 hover:bg-[#12558A]"><Plus className="h-4 w-4" /> Add User</button> : <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-[#64748B]"><LockKeyhole className="h-4 w-4" /> NSO read-only</span>}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Authorized Users', value: users.length, detail: 'Government accounts', icon: Users, tone: 'bg-blue-50 text-[#1769AA]' },
          { label: 'Active Users', value: activeCount, detail: 'Access currently enabled', icon: UserCheck, tone: 'bg-green-50 text-[#16A34A]' },
          { label: 'Inactive Users', value: users.length - activeCount, detail: 'Access suspended', icon: UserX, tone: 'bg-slate-100 text-[#64748B]' },
          { label: 'Organizations Connected', value: organizationsConnected, detail: 'MoSPI · NSO · RBI', icon: Building2, tone: 'bg-violet-50 text-[#7C3AED]' },
        ].map((card) => <div key={card.label} className="intel-card p-5"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><card.icon className="h-5 w-5" /></div><div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{card.label}</div><div className="mt-1 font-heading text-3xl font-extrabold text-[#172033]">{card.value}</div><div className="mt-1 text-xs text-[#64748B]">{card.detail}</div></div>)}
      </section>

      <section className="intel-card overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] p-5 xl:flex-row xl:items-center sm:p-6">
          <div><h2 className="font-heading text-xl font-extrabold text-[#172033]">Government Users</h2><p className="mt-1 text-xs text-[#64748B]">Showing {displayedUsers.length} of {users.length} authorized identities</p></div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-52 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#1769AA]" /></div>
            <select value={organizationFilter} onChange={(event) => setOrganizationFilter(event.target.value as OrganizationFilter)} className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs font-semibold text-[#334155]"><option>All</option><option>MoSPI</option><option>NSO</option><option>RBI</option></select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs font-semibold text-[#334155]"><option>All</option><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]"><tr><th className="px-5 py-3.5">User Name</th><th className="px-4 py-3.5">Email</th><th className="px-4 py-3.5">Organization</th><th className="px-4 py-3.5">Role & Permissions</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Last Login</th><th className="px-4 py-3.5">Created On</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {displayedUsers.map((user) => (
                <tr key={user.id} className={`transition hover:bg-[#F8FAFC] ${user.status === 'Inactive' ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2540] text-[10px] font-extrabold text-white">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><span className="font-bold text-[#172033]">{user.name}</span></div></td>
                  <td className="px-4 py-4 font-mono text-[11px] text-[#475569]">{user.email}</td><td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 font-bold text-[#334155]"><Building2 className="h-3.5 w-3.5 text-[#94A3B8]" /> {user.organization}</span></td>
                  <td className="px-4 py-4"><RoleBadge role={user.role} /><div className="mt-1.5 max-w-48 truncate text-[9px] text-[#94A3B8]">{USER_ROLE_PERMISSIONS[user.role].slice(0, 3).join(' · ')}{USER_ROLE_PERMISSIONS[user.role].length > 3 ? ` +${USER_ROLE_PERMISSIONS[user.role].length - 3}` : ''}</div></td>
                  <td className="px-4 py-4"><StatusBadge status={user.status} /></td><td className="px-4 py-4 text-[#475569]">{formatDateTime(user.lastLogin)}</td><td className="px-4 py-4 text-[#64748B]">{formatDate(user.createdOn)}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><button onClick={() => setProfileId(user.id)} className="rounded-lg border border-[#E2E8F0] p-2 text-[#475569] hover:bg-slate-100" aria-label={`View ${user.name}`}><Eye className="h-3.5 w-3.5" /></button>{canEdit && <><button onClick={() => openEdit(user)} className="rounded-lg border border-[#E2E8F0] p-2 text-[#1769AA] hover:bg-blue-50" aria-label={`Edit ${user.name}`}><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => setToggleTarget(user)} className={`rounded-lg border p-2 ${user.status === 'Active' ? 'border-red-100 text-[#DC2626] hover:bg-red-50' : 'border-green-100 text-[#16A34A] hover:bg-green-50'}`} aria-label={`${user.status === 'Active' ? 'Disable' : 'Enable'} ${user.name}`}><Power className="h-3.5 w-3.5" /></button></>}</div></td>
                </tr>
              ))}
              {displayedUsers.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#64748B]">No users match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="intel-card p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1769AA]"><Activity className="h-5 w-5" /></div><div><h2 className="font-heading text-xl font-extrabold text-[#172033]">Recent Activity</h2><p className="text-xs text-[#64748B]">Latest identity administration events</p></div></div><div className="grid gap-3 lg:grid-cols-3">{activity.map((entry) => <div key={entry.id} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${entry.tone === 'green' ? 'bg-green-500' : entry.tone === 'amber' ? 'bg-amber-500' : entry.tone === 'blue' ? 'bg-blue-500' : 'bg-slate-400'}`} /><div><div className="text-xs font-bold text-[#334155]">{entry.message}</div><div className="mt-1 text-[10px] text-[#94A3B8]">{entry.actor} · {formatDateTime(entry.timestamp)}</div></div></div></div>)}</div></section>

      {editor && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A2540]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null); }}><form onSubmit={saveUser} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex justify-between"><div><div className="text-xs font-extrabold uppercase tracking-wider text-[#1769AA]">Government identity</div><h2 className="mt-1 font-heading text-2xl font-extrabold text-[#172033]">{editor.mode === 'add' ? 'Add Authorized User' : 'Edit User'}</h2></div><button type="button" onClick={() => setEditor(null)} className="rounded-xl p-2 text-[#64748B] hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#334155] sm:col-span-2">Full Name<input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} placeholder="Full government user name" className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA]" /></label>
        <label className="text-xs font-bold text-[#334155] sm:col-span-2">Government Email<input type="email" value={editor.email} disabled={editor.mode === 'edit'} onChange={(event) => setEditor({ ...editor, email: event.target.value })} placeholder="name@vayusetu.gov.in" className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm outline-none focus:border-[#1769AA] disabled:opacity-60" /></label>
        <label className="text-xs font-bold text-[#334155]">Organization<select value={editor.organization} onChange={(event) => { const organization = event.target.value as GovernmentOrganization; setEditor({ ...editor, organization, role: ORGANIZATION_ROLE[organization] }); }} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm"><option>MoSPI</option><option>NSO</option><option>RBI</option></select></label>
        <label className="text-xs font-bold text-[#334155]">Role<select value={editor.role} onChange={(event) => { const role = event.target.value as GovernmentUserRole; setEditor({ ...editor, role, organization: ROLE_ORGANIZATION[role] }); }} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm"><option>MoSPI Admin</option><option>NSO Official</option><option>RBI Analyst</option></select></label>
        <label className="text-xs font-bold text-[#334155] sm:col-span-2">Account Status<select value={editor.status} onChange={(event) => setEditor({ ...editor, status: event.target.value as AccountStatus })} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-3 text-sm"><option>Active</option><option>Inactive</option></select></label>
      </div>{editorError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-[#B91C1C]">{editorError}</div>}<div className="mt-7 flex justify-end gap-2"><button type="button" onClick={() => setEditor(null)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-bold text-[#475569]">Cancel</button><button type="submit" className="rounded-xl bg-[#1769AA] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#12558A]">{editor.mode === 'add' ? 'Add User' : 'Save Changes'}</button></div></form></div>}

      {toggleTarget && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A2540]/55 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${toggleTarget.status === 'Active' ? 'bg-red-50 text-[#DC2626]' : 'bg-green-50 text-[#16A34A]'}`}><Power className="h-7 w-7" /></div><h2 className="mt-5 font-heading text-xl font-extrabold text-[#172033]">{toggleTarget.status === 'Active' ? 'Disable' : 'Enable'} {toggleTarget.name}?</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">The account will remain in the authorized-user registry and can be {toggleTarget.status === 'Active' ? 'enabled' : 'disabled'} again later.</p><div className="mt-7 flex justify-center gap-2"><button onClick={() => setToggleTarget(null)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-bold text-[#475569]">Cancel</button><button onClick={confirmToggle} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold text-white ${toggleTarget.status === 'Active' ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}>Confirm {toggleTarget.status === 'Active' ? 'Disable' : 'Enable'}</button></div></section></div>}

      {profileUser && <div className="fixed inset-0 z-[80] bg-[#0A2540]/35 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileId(null); }}><aside className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A2540] text-lg font-extrabold text-white">{profileUser.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><button onClick={() => setProfileId(null)} className="rounded-xl p-2 text-[#64748B] hover:bg-slate-100"><X className="h-5 w-5" /></button></div><h2 className="mt-5 font-heading text-2xl font-extrabold text-[#172033]">{profileUser.name}</h2><div className="mt-2 flex flex-wrap gap-2"><RoleBadge role={profileUser.role} /><StatusBadge status={profileUser.status} /></div><div className="mt-7 space-y-4 border-y border-[#E2E8F0] py-6">{[
        ['Email', profileUser.email], ['Organization', profileUser.organization], ['Last Login', formatDateTime(profileUser.lastLogin)], ['Account Created', formatDate(profileUser.createdOn)], ['Last Updated', formatDateTime(profileUser.lastUpdated)],
      ].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><span className="text-xs font-semibold text-[#94A3B8]">{label}</span><span className="text-right text-xs font-bold text-[#334155]">{value}</span></div>)}</div><div className="mt-7"><div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1769AA]"><ShieldCheck className="h-4 w-4" /> Assigned Permissions</div><div className="space-y-2">{USER_ROLE_PERMISSIONS[profileUser.role].map((permission) => <div key={permission} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold text-[#334155]"><UserCheck className="h-3.5 w-3.5 text-[#16A34A]" /> {permission}</div>)}</div></div><div className="mt-7 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] text-[#1769AA]"><Clock3 className="h-4 w-4" /> Frontend-only identity record; backend synchronization is not enabled.</div></aside></div>}
    </div>
  );
}
