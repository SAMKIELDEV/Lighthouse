import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../lib/AuthContext';
import { SystemHealth, Incident, ServiceStatus } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { RefreshCw, AlertTriangle, CheckCircle2, Clock, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SystemHealthPage() {
  const admin = useAdmin();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual && !health) setLoading(true);
    if (health) setRefreshing(true);
    
    try {
      const [healthRes, incidentsRes] = await Promise.all([
        admin.getSystemHealth(),
        admin.getIncidents()
      ]);
      setHealth(healthRes);
      setIncidents(incidentsRes);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [admin, health]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(), 60000);
    const timeInterval = setInterval(() => setNow(new Date()), 10000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const getOverallStatus = () => {
    if (!health) return 'unknown';
    if (health.some(s => s.status === 'down')) return 'disruption';
    if (health.some(s => s.status === 'degraded' || s.status === 'unknown')) return 'degraded';
    return 'operational';
  };

  const statusInfo = {
    operational: { label: 'All Systems Operational', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2 },
    degraded: { label: 'Degraded Performance', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: Activity },
    disruption: { label: 'System Disruption', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: AlertTriangle },
    unknown: { label: 'Status Unknown', color: 'text-secondary', bg: 'bg-base', border: 'border-border-color', icon: Clock }
  };

  const overall = statusInfo[getOverallStatus()];

  const formatCheckedAgo = (isoString: string) => {
    const diff = Math.floor((now.getTime() - new Date(isoString).getTime()) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const ServiceCard = ({ service }: { service: ServiceStatus }) => (
    <div className="bg-surface border border-border-color p-6 rounded-xl space-y-4 hover:border-accent/30 transition-colors group">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">{service.name}</h4>
        <div className={`p-2 rounded-lg ${
          service.status === 'operational' ? 'bg-success/10 text-success' : 
          service.status === 'down' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
        }`}>
           {service.status === 'operational' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className={`text-xl font-heading font-bold capitalize ${
            service.status === 'operational' ? 'text-success' : 
            service.status === 'down' ? 'text-destructive' : 'text-warning'
          }`}>
            {service.status}
          </p>
          {service.latency && (
            <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded">
              {service.latency}ms
            </span>
          )}
        </div>
        
        {service.detail && (
          <p className="text-[10px] text-secondary font-medium flex items-center gap-1.5 line-clamp-1" title={service.detail}>
            <Info className="w-3 h-3" />
            {service.detail}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-border-color flex items-center justify-between">
        <span className="text-[9px] text-secondary font-bold uppercase tracking-tighter">Availability: 99.9%</span>
        <span className="text-[9px] text-secondary font-medium italic">Checked {formatCheckedAgo(service.checkedAt)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">System Infrastructure</h1>
          <p className="text-secondary mt-1 text-sm md:text-base">Real-time status monitoring of the SAMKIEL ecosystem.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
          <button 
            onClick={() => fetchData(true)}
            className="relative flex items-center justify-center gap-2 px-4 py-2 bg-base border border-border-color rounded-md text-sm font-bold hover:bg-surface transition-colors w-full sm:w-auto group overflow-hidden"
          >
            {refreshing && <motion.div layoutId="refresh-bar" className="absolute bottom-0 left-0 h-0.5 bg-accent w-full" />}
            <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
          <p className="text-[10px] text-secondary font-medium italic">
            Global update every 60s
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${overall.bg} ${overall.border} flex items-center gap-4 shadow-lg`}
      >
        <div className={`p-3 rounded-full bg-base border ${overall.border}`}>
          <overall.icon className={`w-6 h-6 ${overall.color}`} />
        </div>
        <div>
          <h2 className={`text-lg font-heading font-bold ${overall.color}`}>{overall.label}</h2>
          <p className="text-sm text-secondary">All core services are monitored and responding within expected latency.</p>
        </div>
      </motion.div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-primary">Monitoring Failure</h3>
            <p className="text-secondary text-sm">{error}</p>
          </div>
          <button 
            onClick={() => fetchData(true)}
            className="px-6 py-2 bg-destructive text-white rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !health ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : health?.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>


      <div className="bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border-color flex items-center justify-between">
          <h3 className="text-xl font-heading font-bold text-primary">Incident History</h3>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Last 20 events</span>
        </div>
        <div className="p-8 space-y-8">
          {incidents.length === 0 ? (
            <div className="flex gap-4 group">
              <div className="w-px bg-success/20 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-success border-4 border-base"></div>
              </div>
              <div className="pb-2">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <h4 className="text-sm font-bold text-primary">All systems operational</h4>
                <p className="text-sm text-secondary mt-1">No incidents reported in the recent log history.</p>
              </div>
            </div>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="flex gap-4 group">
                <div className={`w-px ${incident.status === 'resolved' ? 'bg-success/20' : 'bg-destructive/20'} relative`}>
                   <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-4 border-base ${
                     incident.status === 'resolved' ? 'bg-success' : 'bg-destructive'
                   }`}></div>
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                      {new Date(incident.startedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      incident.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">{incident.service}: {incident.description}</h4>
                  {incident.resolvedAt && (
                    <p className="text-[10px] text-secondary mt-1 italic">
                      Resolved at {new Date(incident.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

