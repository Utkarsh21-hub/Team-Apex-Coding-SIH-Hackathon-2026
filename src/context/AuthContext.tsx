import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { dataStore, DEMO_PROFILES } from '../lib/dataStore';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  quickLoginAs: (role: UserRole) => void;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    organization: string;
    address: string;
    designation?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  allProfiles: UserProfile[];
  refreshData: () => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => dataStore.getCurrentUser());
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => dataStore.getProfiles());

  const refreshData = () => {
    setAllProfiles(dataStore.getProfiles());
    const curr = dataStore.getCurrentUser();
    setUser(curr);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    const existing = allProfiles.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      if (!existing.isActive) {
        throw new Error('This account has been deactivated by the Legal Metrology Administrator.');
      }
      dataStore.setCurrentUser(existing.id);
      setUser(existing);
      return true;
    }

    // If demo email or role specified, auto-match or create
    if (requestedRole) {
      const matchRole = allProfiles.find((p) => p.role === requestedRole);
      if (matchRole) {
        dataStore.setCurrentUser(matchRole.id);
        setUser(matchRole);
        return true;
      }
    }

    return false;
  };

  const quickLoginAs = (role: UserRole) => {
    const target = allProfiles.find((p) => p.role === role) || DEMO_PROFILES.find((p) => p.role === role);
    if (target) {
      dataStore.setCurrentUser(target.id);
      setUser(target);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    organization: string;
    address: string;
    designation?: string;
  }): Promise<UserProfile> => {
    const newProf = dataStore.createProfile({
      ...data,
      isActive: true,
    });
    dataStore.setCurrentUser(newProf.id);
    setUser(newProf);
    setAllProfiles(dataStore.getProfiles());
    return newProf;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = dataStore.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      setAllProfiles(dataStore.getProfiles());
    }
  };

  const resetDemoData = () => {
    dataStore.resetToDefaults();
    refreshData();
  };

  const role: UserRole = user ? user.role : 'applicant';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        quickLoginAs,
        signup,
        logout,
        updateProfile,
        allProfiles,
        refreshData,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
