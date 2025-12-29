
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Submission, AdminUser } from '@/lib/types';

interface AuthUser {
    id: string; // This will be the tiktok username
    submission: Submission | null;
}

interface AdminAuthContextType {
  user: AuthUser | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  setSubmission: (submission: Submission | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'user-session';
const ADMIN_SESSION_KEY = 'admin-session';


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to load session from sessionStorage
    setIsLoading(true);
    try {
        const storedUser = sessionStorage.getItem(USER_SESSION_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const storedAdminUser = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (storedAdminUser) {
            setAdminUser(JSON.parse(storedAdminUser));
        }
    } catch (e) {
        console.error("Failed to parse user session", e);
        sessionStorage.removeItem(USER_SESSION_KEY);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string) => {
    setIsLoading(true);
    const id = username.startsWith('@') ? username.substring(1) : username;
    try {
        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, login: true })
        });
        
        const submissionData = await res.json();

        if (!res.ok && res.status !== 404) {
             throw new Error(submissionData.message || 'Could not log in.');
        }

        const newUser: AuthUser = { id, submission: res.ok ? submissionData : null };
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
        setUser(newUser);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(USER_SESSION_KEY);
    setUser(null);
  }, []);
  
  const setSubmission = useCallback((submission: Submission | null) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, submission };
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    });
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const res = await fetch('/api/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, login: true }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Login failed.');
        }
        const adminData: AdminUser = await res.json();
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
        setAdminUser(adminData);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const adminLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUser(null);
  }, []);


  const value = useMemo(() => ({ 
      user, 
      adminUser,
      isLoading,
      login,
      logout,
      adminLogin,
      adminLogout,
      setSubmission,
      setIsLoading
    }), [user, adminUser, isLoading, login, logout, adminLogin, adminLogout, setSubmission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
