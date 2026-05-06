import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { ProductsPage } from './pages/Products';
import { StudioPage } from './pages/Studio';
import { AuthLogsPage } from './pages/AuthLogs';
import { SystemHealthPage } from './pages/SystemHealth';
import { AdminProvider } from './lib/AdminContext';

// Helper to get cookie for SAMKIEL ID
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function App() {
  // Extract token from cookie (SAMKIEL ID standard)
  const token = getCookie('sk_access_token') || 'mock_admin_token';

  return (
    <AdminProvider token={token}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="auth-logs" element={<AuthLogsPage />} />
            <Route path="system" element={<SystemHealthPage />} />
            <Route path="*" element={<div className="text-secondary text-center mt-20">Page not found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
