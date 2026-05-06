import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { ProductsPage } from './pages/Products';
import { StudioPage } from './pages/Studio';
import { AuthLogsPage } from './pages/AuthLogs';
import { SystemHealthPage } from './pages/SystemHealth';
import { LoginPage } from './pages/Login';
import { NotFoundPage } from './pages/NotFound';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AlertProvider } from './lib/AlertContext';

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="studio" element={<StudioPage />} />
              <Route path="auth-logs" element={<AuthLogsPage />} />
              <Route path="system" element={<SystemHealthPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AlertProvider>
  );
}
