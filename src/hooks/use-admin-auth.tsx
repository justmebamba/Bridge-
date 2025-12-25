
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AdminUser } from '@/lib/types';

interface AdminAuthContextType {
  user: User | null;
  adminInfo: AdminUser | null;
  isAdmin: boolean;
  isMainAdmin: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  adminInfo: null,
  isAdmin: false,
  isMainAdmin: false,
  isLoading: true,
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const res = await fetch('/api/admins');
          const admins: AdminUser[] = await res.json();
          const currentAdmin = admins.find(admin => admin.id === user.uid);
          if (currentAdmin && currentAdmin.isVerified) {
            setAdminInfo(currentAdmin);
          } else {
            setAdminInfo(null);
          }
        } catch (error) {
          console.error("Failed to fetch admin status", error);
          setAdminInfo(null);
        }
      } else {
        setAdminInfo(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user,
    adminInfo,
    isAdmin: !!adminInfo,
    isMainAdmin: adminInfo?.isMainAdmin || false,
    isLoading,
  }), [user, adminInfo, isLoading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// We need to wrap the admin layout with this provider.
// This cannot be done in the layout file itself.
// So we create a new component that does it.
export const AdminAuthWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <AdminAuthProvider>
            {children}
        </AdminAuthProvider>
    )
}
