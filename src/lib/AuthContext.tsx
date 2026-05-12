import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient, SamkielUser, AdminClient } from '@samkiel/authsdk';

interface AuthContextType {
  user: SamkielUser | null;
  isLoading: boolean;
  client: AdminClient;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://id.samkiel.tech';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SamkielUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authsdk = useMemo(() => createClient(API_URL), []);
  const client = useMemo(() => new AdminClient(API_URL), []);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const sessionUser = await authsdk.getSession();
        if (cancelled) return;

        if (!sessionUser) {
          setUser(null);
          return;
        }

        if (sessionUser.role !== 'admin') {
          await authsdk.signOut();
          setUser(null);
          return;
        }

        setUser(sessionUser);
        authsdk.startAutoRefresh();
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restore();

    const unsubscribe = authsdk.onAuthLogout(() => {
      setUser(null);
      authsdk.stopAutoRefresh();
      // AuthProvider lives outside BrowserRouter, so useNavigate isn't available.
      // A full-page redirect is fine here — the page state is gone anyway.
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login?error=session_expired');
      }
    });

    return () => {
      cancelled = true;
      authsdk.stopAutoRefresh();
      unsubscribe();
    };
  }, [authsdk]);

  const signIn = async (email: string, password: string) => {
    const response = await authsdk.signIn(email, password);

    if (!response.user || response.user.role !== 'admin') {
      await authsdk.signOut();
      throw new Error('Access denied — admin privileges required');
    }

    setUser(response.user);
    authsdk.startAutoRefresh();
  };

  const signOut = async () => {
    await authsdk.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, client, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAdmin() {
  const { client } = useAuth();
  return client;
}
