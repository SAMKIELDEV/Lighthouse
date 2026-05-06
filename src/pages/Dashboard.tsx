import { motion } from 'framer-motion';
import { Users, Activity, Layers, AlertCircle } from 'lucide-react';
import { systemHealth } from '../mock/systemHealth';

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend?: string }) {
  return (
    <div className="bg-surface border border-border-color p-6 rounded-xl flex items-start justify-between">
      <div>
        <p className="text-secondary text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-heading font-semibold text-primary">{value}</h3>
        {trend && <p className="text-accent text-xs mt-2 font-medium">{trend}</p>}
      </div>
      <div className="p-3 bg-base rounded-lg border border-border-color">
        <Icon className="w-6 h-6 text-accent" />
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-heading font-bold">Good evening, Ezekiel</h1>
        <p className="text-secondary mt-1">Here's what's happening across the SAMKIEL ecosystem today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="12,500" icon={Users} trend="+12% this month" />
        <StatCard title="Active Sessions" value="842" icon={Activity} />
        <StatCard title="Products Live" value="3" icon={Layers} />
        <StatCard title="Open Issues" value="1" icon={AlertCircle} trend="-3 since yesterday" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border-color rounded-xl p-6">
           <h3 className="text-lg font-heading font-semibold mb-4">Recent Activity</h3>
           <div className="text-secondary text-sm space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent"></div>
               <p><span className="text-primary">User #492</span> signed into Kiv</p>
               <span className="ml-auto text-xs">2m ago</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-success"></div>
               <p><span className="text-primary">New registration</span> via Account</p>
               <span className="ml-auto text-xs">15m ago</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-warning"></div>
               <p><span className="text-primary">System</span> detected high latency on Vercel</p>
               <span className="ml-auto text-xs">1h ago</span>
             </div>
           </div>
        </div>

        <div className="bg-surface border border-border-color rounded-xl p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            {systemHealth.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm">{service.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${service.status === 'Operational' ? 'bg-success' : 'bg-warning'}`}></span>
                  <span className="text-xs text-secondary">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
