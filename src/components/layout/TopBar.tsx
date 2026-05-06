import { useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { NotificationBell } from './NotificationBell';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/users': 'Users',
  '/products': 'Products',
  '/studio': 'Studio',
  '/auth-logs': 'Auth Logs',
  '/system': 'Health',
};

interface TopBarProps {
  isMobile?: boolean;
}

export function TopBar({ isMobile }: TopBarProps) {
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] || 'Lighthouse';

  if (isMobile) {
    return (
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    );
  }

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-base/80 backdrop-blur-md border-b border-border-color z-10 flex items-center justify-between px-8">
      <h2 className="text-xl font-heading font-semibold text-primary">{title}</h2>

      <div className="flex items-center gap-6">
        <SearchBar />
        <NotificationBell />
      </div>
    </header>
  );
}

