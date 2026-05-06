import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/users': 'Users & Accounts',
  '/products': 'Products & Apps',
  '/studio': 'Studio Metrics',
  '/auth-logs': 'Auth Event Logs',
  '/system': 'System Health',
};

export function TopBar() {
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] || 'Lighthouse';

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-base/80 backdrop-blur-md border-b border-border-color z-10 flex items-center justify-between px-8">
      <h2 className="text-xl font-heading font-semibold">{title}</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input 
            type="text" 
            placeholder="Search SAMKIEL ecosystem..." 
            className="bg-surface border border-border-color rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all w-64 text-primary"
          />
        </div>
        
        <button aria-label="Notifications" className="relative text-secondary hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
