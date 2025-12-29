
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
  checked: boolean; // New flag to indicate if auth state has been checked
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
  const [checked, setChecked] = useState(false); // New state

  useEffect(() => {
    // This effect runs once on mount to check all auth states
    let isMounted = true;
    
    const checkAllAuth = async () => {
        // 1. Check client-side session for regular user
        const storedUser = sessionStorage.getItem(USER_SESSION_KEY);
        if (isMounted && storedUser) {
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
        
        // 2. Check Firebase auth state for admin user
        const auth = getAuth(firebaseApp);
        onAuthStateChanged(auth, async (fbUser) => {
            if (isMounted) {
                setFirebaseUser(fbUser);
                if (fbUser) {
                    try {
                        const idTokenResult = await fbUser.getIdTokenResult();
                        const adminDetailsResponse = await fetch('/api/auth/session');
                        const adminDetails = await adminDetailsResponse.json();
                        
                        // Verify claims match details
                        if (adminDetails.isLogged && idTokenResult.claims.isVerified === adminDetails.user.isVerified) {
                           setAdminUser(adminDetails.user);
                        } else {
                           setAdminUser(null);
                           if (idTokenResult.claims.isVerified !== adminDetails.user.isVerified) {
                               // Claims are out of sync, force a refresh
                               await fbUser.getIdToken(true);
                           }
                        }
                    } catch (error) {
                        console.error("Error fetching admin session:", error);
                        setAdminUser(null);
                    }
                } else {
                    setAdminUser(null);
                }
                // 3. Mark auth check as complete
                setIsLoading(false);
                setChecked(true);
            }
        });
    }

    checkAllAuth();

    return () => { isMounted = false; };
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
    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Set session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Manually trigger onAuthStateChanged logic to update local state immediately
      setFirebaseUser(userCredential.user);
      const adminDetailsResponse = await fetch('/api/auth/session');
      const adminDetails = await adminDetailsResponse.json();
      if(adminDetails.isLogged) {
        setAdminUser(adminDetails.user);
      } else {
        throw new Error('Session login failed.');
      }

    } catch (error: any) {
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
    const auth = getAuth(firebaseApp);
    try {
      await signOut(auth);
      // Client-side sign out is enough, onAuthStateChanged will handle the rest.
      // It will clear firebaseUser and adminUser.
    } catch (error) {
        console.error("Error signing out:", error);
    }
  }, []);

  const value = useMemo(() => ({ 
      user, 
      adminUser,
      firebaseUser,
      isLoading,
      checked,
      login,
      logout,
      adminLogin,
      adminLogout,
      setSubmission
    }), [user, adminUser, firebaseUser, isLoading, checked, login, logout, adminLogin, adminLogout, setSubmission]);

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
