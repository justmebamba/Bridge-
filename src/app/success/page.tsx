
'use client';

import { CheckCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Submission } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchSubmission = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
        const res = await fetch(`/api/submissions?id=${user.uid}`);
        if (res.status === 404) {
            setSubmission(null);
            return;
        }
        if (!res.ok) throw new Error('An error occurred while fetching the data.');
        const data: Submission = await res.json();
        setSubmission(data);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
    if(user) {
        fetchSubmission();
    }
  }, [user, isAuthLoading, router, fetchSubmission]);
  
  const isLoading = isAuthLoading || isLoadingData;
  
  if (isLoading) {
      return (
          <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  // This check is to ensure that the user has actually completed the submission
  if (submission?.finalCodeStatus !== 'approved') {
      router.replace('/start');
      return (
           <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <PartyPopper className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Submission Complete!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for submitting your information.
          </p>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-muted-foreground text-sm text-center max-w-xs">
                Your application has been received and approved. Your account is now fully bridged.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
