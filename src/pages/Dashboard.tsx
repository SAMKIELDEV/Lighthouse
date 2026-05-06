import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Layers, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../lib/AuthContext';
import { AdminDashboardStats, SystemHealth, AdminActivityLog } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';

function StatCard({ title, value, icon: Icon, trend, loading }: { title: string, value: string | number, icon: any, trend?: string, loading?: boolean }) {
  return (
    <div className="bg-surface border border-border-color p-6 rounded-xl flex items-start justify-between">
      <div>
        <p className="text-secondary text-sm font-medium mb-2">{title}</p>
        {loading ? <Skeleton className="h-9 w-24" /> : <h3 className="text-3xl font-heading font-semibold text-primary">{value}</h3>}
        {trend && !loading && <p className="text-accent text-xs mt-2 font-medium">{trend}</p>}
      </div>
      <div className="p-3 bg-base rounded-lg border border-border-color">
        <Icon className="w-6 h-6 text-accent" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const admin = useAdmin();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [statsData, healthData] = await Promise.all([
        admin.getDashboardStats(),
        admin.getSystemHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">Good evening, Ezekiel</h1>
          <p className="text-secondary mt-1 text-sm md:text-base">Here's what's happening across the SAMKIEL ecosystem today.</p>
        </div>
        <p className="text-[10px] text-secondary font-medium italic">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers.toLocaleString() || '0'} icon={Users} loading={loading && !stats} />
        <StatCard title="Active Sessions" value={stats?.activeSessions.toLocaleString() || '0'} icon={Activity} loading={loading && !stats} />
        <StatCard title="Products Live" value={stats?.productsLive || '0'} icon={Layers} loading={loading && !stats} />
        <StatCard title="Open Issues" value={stats?.openIssues || '0'} icon={AlertCircle} loading={loading && !stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border-color rounded-xl p-6">
           <h3 className="text-lg font-heading font-semibold mb-6">Recent Activity</h3>
           <div className="space-y-6">
             {loading && !stats ? (
               Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
             ) : stats?.recentActivity.length === 0 ? (
               <p className="text-secondary text-sm italic">No recent activity.</p>
             ) : (
               stats?.recentActivity.map((activity: AdminActivityLog) => (
                 <div key={activity.id} className="flex items-center gap-4 group">
                   <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform"></div>
                   <p className="text-sm text-secondary flex-1">
                     <span className="text-primary font-medium">{activity.message}</span>
                   </p>
                   <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                     {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="bg-surface border border-border-color rounded-xl p-6">
          <h3 className="text-lg font-heading font-semibold mb-6">System Health</h3>
          <div className="space-y-4">
            {loading && !health ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : health ? (
              health.map((service) => (
                <HealthItem key={service.name} name={service.name} status={service.status} />
              ))
            ) : (
              <p className="text-secondary text-sm italic">Health data unavailable.</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-border-color">
            <a href="/system" className="text-xs font-bold text-accent hover:underline flex items-center gap-2">
              View Detailed Health Report
            </a>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

function HealthItem({ name, status }: { name: string, status: string }) {
  const isOk = status === 'operational';
  const isDown = status === 'down';
  
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-primary">{name}</p>
      <div className="flex items-center gap-2">
        {isOk ? (
          <CheckCircle2 className="w-3 h-3 text-success" />
        ) : isDown ? (
          <AlertCircle className="w-3 h-3 text-destructive" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-warning" />
        )}
        <span className={`text-[10px] font-bold uppercase ${
          isOk ? 'text-success' : isDown ? 'text-destructive' : 'text-warning'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

