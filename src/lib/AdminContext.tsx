import React, { createContext, useContext, useMemo } from 'react';
import { AdminClient } from '@samkiel/authsdk';

interface AdminContextType {
  client: AdminClient;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children, token }: { children: React.ReactNode, token: string }) {
  const client = useMemo(() => {
    return new AdminClient('https://id.samkiel.tech', token);
  }, [token]);

  return (
    <AdminContext.Provider value={{ client }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context.client;
}
