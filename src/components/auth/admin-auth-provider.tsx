'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user) return null;
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
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
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
