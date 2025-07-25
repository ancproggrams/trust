
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ExtendedAuthContextType, OnboardingFormData, UserProfile } from '@/lib/types';
import { mockUserProfiles, mockDemoSettings, getDemoData, resetDemoData } from '@/lib/mock-data';

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

// Mock users voor testing - niet weergeven in UI
const mockUser: User = {
  id: '1',
  name: 'Jan Janssen',
  email: 'jan@trust.io',
  createdAt: new Date(),
};

const demoUser: User = {
  id: 'demo',
  name: 'Demo Gebruiker',
  email: 'demo@trust.io',
  createdAt: new Date(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check voor opgeslagen authenticatie status
    const savedAuth = localStorage.getItem('trust_io_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setUser(authData.user);
      setProfile(authData.profile || null);
      setIsDemo(authData.isDemo || false);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock authenticatie - accepteer elke geldige email/password combinatie
    if (email && password && email.includes('@') && password.length >= 6) {
      const userData = {
        ...mockUser,
        email: email,
        name: email === 'jan@trust.io' ? 'Jan Janssen' : email.split('@')[0]
      };
      
      // Find matching profile
      const userProfile = mockUserProfiles.find(p => p.userId === userData.id);
      
      setUser(userData);
      setProfile(userProfile || null);
      setIsDemo(false);
      
      localStorage.setItem('trust_io_auth', JSON.stringify({ 
        user: userData, 
        profile: userProfile,
        isDemo: false 
      }));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const demoLogin = async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Create demo profile
      const demoProfile: UserProfile = {
        id: 'demo-profile',
        userId: 'demo',
        companyName: 'Demo ZZP B.V.',
        kvkNumber: '87654321',
        vatNumber: 'NL987654321B01',
        phone: '+31 6 87654321',
        address: 'Trust.io-laan 456',
        postalCode: '1000CD',
        city: 'Amsterdam',
        country: 'Netherlands',
        iban: 'NL91TRUST0417164300',
        bankName: 'Trust.io Bank',
        accountHolder: 'Demo ZZP B.V.',
        validationStatus: 'VALIDATED',
        validatedAt: new Date(),
        validatedBy: 'system',
        businessType: 'ZZP',
        onboardingStep: 'COMPLETED',
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(demoUser);
      setProfile(demoProfile);
      setIsDemo(true);
      
      // Reset demo data
      resetDemoData();
      
      localStorage.setItem('trust_io_auth', JSON.stringify({ 
        user: demoUser, 
        profile: demoProfile,
        isDemo: true,
        demoStartedAt: new Date()
      }));
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const register = async (data: OnboardingFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!data.name || !data.email || !data.acceptedTerms || !data.acceptedPrivacy) {
        setLoading(false);
        return false;
      }

      if (!data.email.includes('@')) {
        setLoading(false);
        return false;
      }

      // Create new user
      const userData: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        createdAt: new Date(),
      };

      // Create user profile
      const userProfile: UserProfile = {
        id: `profile-${userData.id}`,
        userId: userData.id,
        companyName: data.companyName,
        kvkNumber: data.kvkNumber,
        vatNumber: data.vatNumber,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city || 'Amsterdam',
        country: data.country || 'Netherlands',
        iban: data.iban,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
        validationStatus: 'PENDING',
        businessType: data.businessType || 'ZZP',
        onboardingStep: 'COMPLETED',
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(userData);
      setProfile(userProfile);
      setIsDemo(data.isDemo);
      
      localStorage.setItem('trust_io_auth', JSON.stringify({ 
        user: userData, 
        profile: userProfile,
        isDemo: data.isDemo 
      }));
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false;
    
    setLoading(true);
    
    try {
      const updatedProfile = {
        ...profile,
        ...data,
        updatedAt: new Date(),
      };
      
      setProfile(updatedProfile);
      
      localStorage.setItem('trust_io_auth', JSON.stringify({ 
        user, 
        profile: updatedProfile,
        isDemo 
      }));
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setIsDemo(false);
    localStorage.removeItem('trust_io_auth');
  };

  const value: ExtendedAuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isDemo,
    login,
    demoLogin,
    register,
    logout,
    loading,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): ExtendedAuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
