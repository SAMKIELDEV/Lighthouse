import { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AuthContext';
import { KivMetrics } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { UserPlus, Users, Activity, TrendingUp } from 'lucide-react';

function MetricCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description: string }) {
  return (
    <div className="bg-surface border border-border-color p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-base rounded-lg text-accent">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-2xl font-heading font-bold text-primary mb-1">{value}</h3>
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{title}</p>
      <p className="text-xs text-secondary">{description}</p>
    </div>
  );
}

export function StudioPage() {
  const admin = useAdmin();
  const [metrics, setMetrics] = useState<KivMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await admin.getKivMetrics();
      setMetrics(res);
    } catch (err: any) {
      console.error(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Studio Metrics — Kiv</h1>
        <p className="text-secondary mt-1">Deep dive into Kiv's performance and user engagement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Signups" 
          value={metrics?.totalSignups || 0} 
          icon={UserPlus} 
          description="Total accounts connected to Kiv" 
        />
        <MetricCard 
          title="Daily Active (DAU)" 
          value={metrics?.dau || 0} 
          icon={Activity} 
          description="Users active in the last 24h" 
        />
        <MetricCard 
          title="Weekly Active (WAU)" 
          value={metrics?.wau || 0} 
          icon={Users} 
          description="Users active in the last 7 days" 
        />
        <MetricCard 
          title="Retention Rate" 
          value={`${metrics?.retentionRate || 0}%`} 
          icon={TrendingUp} 
          description="Active users after 7 days" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Chart */}
        <div className="bg-surface border border-border-color rounded-xl p-6">
          <h3 className="text-lg font-heading font-semibold mb-6">User Acquisition (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.signupsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#E8FF47', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" stroke="#E8FF47" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAU Chart */}
        <div className="bg-surface border border-border-color rounded-xl p-6">
          <h3 className="text-lg font-heading font-semibold mb-6">Daily Active Users (Last 14 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.dauByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#262626', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#E8FF47', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#E8FF47" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
