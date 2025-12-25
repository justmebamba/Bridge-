'use client';

import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface SubmissionData {
  id: string;
  tiktokUsername?: string;
  verificationCode?: string;
  phoneNumberId?: string;
  finalCode?: string;
  isVerified?: boolean;
}

interface SubmissionContextState {
  submission: SubmissionData | null;
  isLoading: boolean;
  userDocRef: any;
}

export const SubmissionContext = createContext<SubmissionContextState | undefined>(undefined);

const protectedRoutes = [
    '/start/verify-code',
    '/start/select-number',
    '/start/final-code',
];

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'tiktok_users', user.uid);
  }, [user, firestore]);

  const { data: submission, isLoading: isSubmissionLoading } = useDoc<SubmissionData>(userDocRef);
  
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Wait until both authentication and submission data loading are complete
    if (isAuthLoading || isSubmissionLoading) {
      return;
    }

    // If user is not signed in, send them to the join page.
    if (!user) {
      router.replace('/join');
      return;
    }

    // If the user's submission is already verified, send them to the dashboard.
    if (submission?.isVerified) {
      router.replace('/dashboard');
      return;
    }
    
    // If the submission document doesn't exist yet and they are on a protected step,
    // redirect them to the first step.
    if (!submission && protectedRoutes.includes(pathname)) {
        router.replace('/start/username');
        return;
    }

    // If all checks pass, we can stop the loading/redirecting state.
    setIsRedirecting(false);

  }, [user, submission, isAuthLoading, isSubmissionLoading, router, pathname]);

  const isLoading = isAuthLoading || isRedirecting;

  if (isLoading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Your Progress...</p>
            </div>
        </div>
    );
  }

  return (
    <SubmissionContext.Provider value={{ submission, isLoading: isSubmissionLoading, userDocRef }}>
      {children}
    </SubmissionContext.Provider>
  );
}
