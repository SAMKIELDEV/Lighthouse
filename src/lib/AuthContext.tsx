import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient, SamkielUser, AdminClient } from '@samkiel/authsdk';

interface AuthContextType {
  user: SamkielUser | null;
  isLoading: boolean;
  client: AdminClient | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://id.samkiel.tech';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SamkielUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const authsdk = useMemo(() => createClient(API_URL), []);

  const client = useMemo(() => {
    // In a real app, we might get the token from cookies or the user object
    // For now, if we have a user, we assume we can create an admin client
    // But AdminClient needs a token. The SDK's login returns tokens.
    // If we're using cookies (standard for this setup), we might need to extract the token.
    const token = document.cookie.split('; ').find(row => row.startsWith('sk_access_token='))?.split('=')[1];
    return token ? new AdminClient(API_URL, token) : null;
  }, [user]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authsdk.me();
      
      if (userData.role !== 'admin') {
        await authsdk.logout();
        setUser(null);
        return;
      }
      
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await authsdk.login(email, password);
    
    if (response.user.role !== 'admin') {
      await authsdk.logout();
      throw new Error('Access denied — admin privileges required');
    }
    
    setUser(response.user);
  };

  const signOut = async () => {
    await authsdk.logout();
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
  if (!client) {
    throw new Error('Admin client not available');
  }
  return client;
}
