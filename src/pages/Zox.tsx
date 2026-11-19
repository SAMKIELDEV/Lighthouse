import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MessageCircle,
  RefreshCw,
  ServerCog,
  Users,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '../components/ui/Skeleton';
import { getZoxOverview, ZoxOverview, ZoxServiceStatus } from '../lib/zox';

const REFRESH_INTERVAL = 30_000;

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatAge(date: string) {
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

const statusClasses: Record<ZoxServiceStatus, string> = {
  operational: 'text-success bg-success/10 border-success/20',
  degraded: 'text-warning bg-warning/10 border-warning/20',
  down: 'text-destructive bg-destructive/10 border-destructive/20',
  unknown: 'text-secondary bg-base border-border-color',
};

function MetricCard({ label, value, detail, icon: Icon, danger = false }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  danger?: boolean;
}) {
  return (
    <article className="rounded-xl border border-border-color bg-surface p-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">{label}</p>
        <span className={`rounded-lg border p-2 ${danger ? 'border-destructive/20 bg-destructive/10 text-destructive' : 'border-border-color bg-base text-accent'}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="font-heading text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-2 text-xs text-secondary">{detail}</p>
    </article>
  );
}

function EmptyPanel({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="rounded-xl border border-warning/25 bg-warning/5 p-6 md:p-8">
      <div className="flex max-w-2xl items-start gap-4">
        <span className="rounded-lg border border-warning/25 bg-warning/10 p-2 text-warning">
          <ServerCog className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-primary">Zox telemetry is not connected</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{error}</p>
          <p className="mt-2 text-xs text-secondary">Expected endpoint: <code className="text-primary">GET $VITE_ZOX_ADMIN_API_URL/overview</code>. Authentication cookies are included with the request.</p>
          <button onClick={retry} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-bold text-black transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry connection
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZoxPage() {
  const [overview, setOverview] = useState<ZoxOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async (initial = false, signal?: AbortSignal) => {
    initial ? setLoading(true) : setRefreshing(true);
    try {
      const data = await getZoxOverview(signal);
      setOverview(data);
      setError(null);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setError(cause instanceof Error ? cause.message : 'Unable to load Zox telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(true, controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh || !overview) return;
    const interval = window.setInterval(() => load(), REFRESH_INTERVAL);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load, overview]);

  const overallStatus = useMemo(() => {
    if (!overview) return 'unknown';
    if (overview.services.some((service) => service.status === 'down')) return 'down';
    if (overview.services.some((service) => service.status === 'degraded')) return 'degraded';
    return 'operational';
  }, [overview]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-24 w-full" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 w-full" />)}</div><Skeleton className="h-80 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent"><Bot className="h-4 w-4" aria-hidden="true" /> Product operations</div>
          <h1 className="font-heading text-2xl font-bold text-primary md:text-3xl">Zox command center</h1>
          <p className="mt-1 text-sm text-secondary md:text-base">Usage, delivery, payments and provider health in one operational view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {overview && <span className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${statusClasses[overallStatus]}`}>{overallStatus}</span>}
          {overview && <span className="inline-flex items-center gap-1.5 text-xs text-secondary"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Updated {formatAge(overview.generatedAt)}</span>}
          <button aria-pressed={autoRefresh} onClick={() => setAutoRefresh((value) => !value)} className="min-h-10 rounded-md border border-border-color bg-surface px-3 text-xs font-bold text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Auto-refresh {autoRefresh ? 'on' : 'off'}</button>
          <button aria-label="Refresh Zox telemetry" onClick={() => load()} disabled={refreshing} className="flex h-10 w-10 items-center justify-center rounded-md border border-border-color bg-surface text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" /></button>
        </div>
      </header>

      {error && !overview ? <EmptyPanel error={error} retry={() => load(true)} /> : overview && (
        <>
          {error && <div role="status" className="flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/5 px-4 py-3 text-sm text-warning"><AlertCircle className="h-4 w-4" aria-hidden="true" /> Refresh failed. Showing the last successful snapshot.</div>}
          <section aria-label="Zox key metrics" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Active users" value={formatNumber(overview.metrics.activeUsers24h)} detail="Last 24 hours" icon={Users} />
            <MetricCard label="Conversations" value={formatNumber(overview.metrics.conversations24h)} detail="Last 24 hours" icon={MessageCircle} />
            <MetricCard label="Credits consumed" value={formatNumber(overview.metrics.creditsConsumed24h)} detail="Last 24 hours" icon={CircleDollarSign} />
            <MetricCard label="Failed jobs" value={formatNumber(overview.metrics.failedJobs24h)} detail={`${formatNumber(overview.metrics.pendingJobs)} currently pending`} icon={AlertCircle} danger={overview.metrics.failedJobs24h > 0} />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-border-color bg-surface p-5 xl:col-span-2">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div><h2 className="font-heading text-lg font-semibold text-primary">Activity pulse</h2><p className="mt-1 text-xs text-secondary">Conversation and tool-call volume reported by Zox.</p></div>
                <Activity className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <div className="h-72" aria-label="Zox activity trend chart">
                {overview.activity.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={overview.activity}><defs><linearGradient id="zoxActivity" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E8FF47" stopOpacity={0.35}/><stop offset="95%" stopColor="#E8FF47" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} axisLine={false}/><YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false}/><Tooltip contentStyle={{ background: '#111111', border: '1px solid #1F1F1F', borderRadius: 8 }}/><Area type="monotone" dataKey="conversations" name="Conversations" stroke="#E8FF47" fill="url(#zoxActivity)" strokeWidth={2}/><Area type="monotone" dataKey="toolCalls" name="Tool calls" stroke="#22C55E" fill="transparent" strokeWidth={2}/></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-secondary">No activity points were returned.</div>}
              </div>
            </div>

            <div className="rounded-xl border border-border-color bg-surface p-5">
              <div className="mb-5 flex items-start justify-between"><div><h2 className="font-heading text-lg font-semibold text-primary">Service health</h2><p className="mt-1 text-xs text-secondary">Delivery path and dependencies.</p></div><ServerCog className="h-5 w-5 text-accent" aria-hidden="true" /></div>
              <div className="space-y-3">{overview.services.map((service) => <div key={service.name} className="rounded-lg border border-border-color bg-base p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-primary">{service.name}</span><span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${statusClasses[service.status]}`}>{service.status}</span></div><div className="mt-2 flex justify-between gap-3 text-xs text-secondary"><span className="truncate">{service.detail || 'No additional detail'}</span>{service.latencyMs !== undefined && <span className="shrink-0">{service.latencyMs} ms</span>}</div></div>)}</div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border-color bg-surface p-5 lg:col-span-2"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-heading text-lg font-semibold text-primary">Open incidents</h2><p className="mt-1 text-xs text-secondary">Failures that need operator attention.</p></div><Wrench className="h-5 w-5 text-accent" aria-hidden="true" /></div>{overview.incidents.length ? <div className="space-y-3">{overview.incidents.map((incident) => <article key={incident.id} className="flex gap-3 rounded-lg border border-border-color bg-base p-4">{incident.severity === 'critical' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-primary">{incident.title}</h3><span className="text-[10px] uppercase text-secondary">{formatAge(incident.createdAt)}</span></div><p className="mt-1 text-xs leading-5 text-secondary">{incident.detail}</p></div></article>)}</div> : <p className="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">No open incidents were reported.</p>}</div>
            <div className="rounded-xl border border-border-color bg-surface p-5"><h2 className="font-heading text-lg font-semibold text-primary">Revenue delivery</h2><p className="mt-1 text-xs text-secondary">Purchase and webhook exceptions.</p><div className="mt-6 space-y-4"><div className="flex items-center justify-between rounded-lg border border-border-color bg-base p-4"><span className="flex items-center gap-2 text-sm text-primary"><CreditCard className="h-4 w-4 text-accent" aria-hidden="true" /> Payment failures</span><strong className={overview.metrics.paymentFailures24h ? 'text-destructive' : 'text-primary'}>{formatNumber(overview.metrics.paymentFailures24h)}</strong></div><div className="flex items-center justify-between rounded-lg border border-border-color bg-base p-4"><span className="flex items-center gap-2 text-sm text-primary"><Activity className="h-4 w-4 text-accent" aria-hidden="true" /> Queue depth</span><strong className="text-primary">{formatNumber(overview.metrics.pendingJobs)}</strong></div></div></div>
          </section>
        </>
      )}
    </div>
  );
}
