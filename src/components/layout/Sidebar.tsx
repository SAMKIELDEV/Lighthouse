import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Grid, BarChart3, ShieldAlert, Activity, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import Logo from '../../assets/SAMKIEL_LOGO.png';

const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Users & Accounts', path: '/users', icon: Users },
  { name: 'Products & Apps', path: '/products', icon: Grid },
  { name: 'Studio Metrics', path: '/studio', icon: BarChart3 },
  { name: 'Auth Logs', path: '/auth-logs', icon: ShieldAlert },
  { name: 'System Health', path: '/system', icon: Activity },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-color flex flex-col z-10">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm group-hover:bg-accent/30 transition-colors"></div>
            <img src={Logo} alt="SAMKIEL" className="relative w-8 h-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-primary leading-none">SAMKIEL</span>
            <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-1">Lighthouse</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative',
                isActive ? 'text-accent bg-base' : 'text-secondary hover:text-primary hover:bg-base/50'
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-md" 
                />
              )}
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-color">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            E
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">Ezekiel</p>
            <p className="text-xs text-secondary truncate">Admin</p>
          </div>
          <button aria-label="Sign Out" className="text-secondary hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
