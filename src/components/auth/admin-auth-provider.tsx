'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  useEffect(() => {
    // If user loading is finished and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/login');
      return;
    }

    // If both are finished loading, check if the user is an admin
    if (!isUserLoading && !isAdminLoading) {
        if (adminDoc === null) {
            // User is not in the admins collection
            router.replace('/login');
        }
    }
  }, [user, isUserLoading, adminDoc, isAdminLoading, router]);

  // While checking auth state or admin status, show a loading screen
  if (isUserLoading || isAdminLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
        </div>
    );
  }

  // If user is authenticated and is an admin, render the children
  if (user && adminDoc) {
    return <>{children}</>;
  }

  // Fallback, though the useEffect should have already redirected
  return null;
}
