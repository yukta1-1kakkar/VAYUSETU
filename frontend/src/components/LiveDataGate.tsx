import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Database, LoaderCircle, RefreshCw } from 'lucide-react';
import { applyLiveDashboard, type LiveDashboardPayload } from '../mock/airfareData';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://vayusetu.onrender.com/api').replace(/\/$/, '');

export function LiveDataGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to the airfare database...');
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/dashboard/live`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
      const payload = await response.json() as LiveDashboardPayload;
      applyLiveDashboard(payload);
      if (!payload.hasData) {
        setMessage('PostgreSQL is connected, but it has no clean airfare observations yet. Run an authorized scraper to populate it.');
        setStatus('empty');
        return;
      }
      setRevision((value) => value + 1);
      setStatus('ready');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load live airfare data.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(true), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (status === 'ready') return <div key={revision}>{children}</div>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F8FB] px-6">
      <div className="max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        {status === 'loading' ? <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-[#1769AA]" />
          : status === 'empty' ? <Database className="mx-auto h-10 w-10 text-[#1769AA]" />
          : <AlertTriangle className="mx-auto h-10 w-10 text-[#DC2626]" />}
        <h2 className="mt-4 text-xl font-bold text-[#172033]">
          {status === 'loading' ? 'Loading live airfare data' : status === 'empty' ? 'Waiting for the first scrape' : 'Live API unavailable'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{message}</p>
        {status !== 'loading' && (
          <button onClick={() => void refresh()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
