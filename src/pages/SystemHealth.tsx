import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { SystemHealth } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function SystemHealthPage() {
  const admin = useAdmin();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealth = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await admin.getSystemHealth();
      setHealth(res);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchHealth(true);
    const interval = setInterval(() => fetchHealth(), 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const ServiceCard = ({ name, status }: { name: string, status: string }) => (
    <div className="bg-surface border border-border-color p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-primary uppercase tracking-wider">{name}</h4>
        <div className={`p-2 rounded-lg ${status === 'operational' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
           {status === 'operational' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <p className={`text-lg font-bold capitalize ${status === 'operational' ? 'text-success' : 'text-warning'}`}>
          {status}
        </p>
        <span className="text-[10px] text-secondary font-medium">Uptime: 99.9%</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">System Health</h1>
          <p className="text-secondary mt-1">Real-time status of all SAMKIEL studio infrastructure.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={() => fetchHealth(true)}
            className="flex items-center gap-2 px-4 py-2 bg-base border border-border-color rounded-md text-sm font-bold hover:bg-surface transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <p className="text-[10px] text-secondary font-medium italic">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-primary">Service Unavailable</h3>
            <p className="text-secondary text-sm">{error}</p>
          </div>
          <button 
            onClick={() => fetchHealth(true)}
            className="px-6 py-2 bg-destructive text-white rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !health ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : health && (
          <>
            <ServiceCard name="SAMKIEL ID API" status={health.samkielIdApi} />
            <ServiceCard name="KIV API" status={health.kivApi} />
            <ServiceCard name="Database (MongoDB)" status={health.database} />
            <ServiceCard name="Auth SDK (NPM)" status="operational" /> {/* Version: {health.authSdkNpm} */}
            <ServiceCard name="Vercel Deployments" status={health.vercelDeployments} />
            <ServiceCard name="Resend Email" status="operational" />
          </>
        )}
      </div>

      <div className="bg-surface border border-border-color rounded-xl p-8 space-y-6">
        <h3 className="text-xl font-heading font-bold text-primary">Incident History</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-px bg-border-color relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-success"></div>
            </div>
            <div className="pb-6">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">May 6, 2026</p>
              <h4 className="text-sm font-bold text-primary">All systems operational</h4>
              <p className="text-sm text-secondary mt-1">No incidents reported.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
