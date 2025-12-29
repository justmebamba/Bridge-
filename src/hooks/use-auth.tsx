
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Submission, AdminUser } from '@/lib/types';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';

interface AuthUser {
    id: string; // This will be the tiktok username
    submission: Submission;
}

interface AdminAuthContextType {
  user: AuthUser | null;
  adminUser: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  setSubmission: (submission: Submission) => void;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'user-session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side session loading
    const storedUser = sessionStorage.getItem(USER_SESSION_KEY);
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if(parsedUser && parsedUser.id && parsedUser.submission){
                setUser(parsedUser);
            } else {
                sessionStorage.removeItem(USER_SESSION_KEY);
            }
        } catch (e) {
            console.error("Failed to parse user session", e);
            sessionStorage.removeItem(USER_SESSION_KEY);
        }
    }
    
    // Firebase auth state listener
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
            try {
                const token = await fbUser.getIdToken();
                const response = await fetch('/api/auth/session', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const fullAdminUser = await response.json();
                    setAdminUser(fullAdminUser);
                } else {
                    setAdminUser(null);
                }
            } catch (error) {
                console.error("Error fetching admin session:", error);
                setAdminUser(null);
            }
        } else {
            setAdminUser(null);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
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

        if (!res.ok) {
             throw new Error(submissionData.message || 'Could not log in.');
        }

        const newUser: AuthUser = { id, submission: submissionData };
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
  
  const setSubmission = useCallback((submission: Submission) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, submission };
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    });
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting the user and session
    } catch (error: any) {
        setIsLoading(false);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             const res = await fetch(`/api/admins?email=${email}`);
             if(res.ok) {
                const admin = await res.json();
                if(admin && !admin.isVerified) {
                    throw new Error('Your account is pending approval.');
                }
             }
            throw new Error('Invalid email or password.');
        }
        throw new Error(error.message || 'An unknown error occurred during login.');
    }
  }, []);

  const adminLogout = useCallback(async () => {
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    try {
        await signOut(auth); // Sign out from Firebase client
        await fetch('/api/auth/session', { method: 'DELETE' }); // Clear server session
        // onAuthStateChanged will set adminUser to null
    } catch (error) {
        console.error("Error signing out:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ 
      user, 
      adminUser,
      firebaseUser,
      isLoading,
      login,
      logout,
      adminLogin,
      adminLogout,
      setSubmission
    }), [user, adminUser, firebaseUser, isLoading, login, logout, adminLogin, adminLogout, setSubmission]);

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
