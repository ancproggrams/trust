
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user voor testing - niet weergeven in UI
const mockUser: User = {
  id: '1',
  name: 'Jan Janssen',
  email: 'jan@zzptrust.nl',
  createdAt: new Date(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check voor opgeslagen authenticatie status
    const savedAuth = localStorage.getItem('zzp_trust_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setUser(authData.user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock authenticatie - accepteer elke gelgige email/password combinatie
    if (email && password && email.includes('@') && password.length >= 6) {
      const userData = {
        ...mockUser,
        email: email,
        name: email === 'jan@zzptrust.nl' ? 'Jan Janssen' : email.split('@')[0]
      };
      
      setUser(userData);
      localStorage.setItem('zzp_trust_auth', JSON.stringify({ user: userData }));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock registratie
    if (name && email && password && email.includes('@') && password.length >= 6) {
      const userData: User = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date(),
      };
      
      setUser(userData);
      localStorage.setItem('zzp_trust_auth', JSON.stringify({ user: userData }));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zzp_trust_auth');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
