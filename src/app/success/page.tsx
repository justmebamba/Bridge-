
'use client';

import { CheckCircle, PartyPopper, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Submission } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchSubmission = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
        const res = await fetch(`/api/submissions?id=${user.id}`);
        if (res.status === 404) {
            setSubmission(null);
            router.replace('/start'); // If no submission, they shouldn't be here
            return;
        }
        if (!res.ok) throw new Error('Failed to fetch submission data.');
        const data: Submission = await res.json();
        setSubmission(data);

        // Security check: ensure the submission is actually approved
        if (data.finalCodeStatus !== 'approved') {
          router.replace('/start');
        }
    } catch (err: any) {
        console.error(err);
        router.replace('/start');
    } finally {
        setIsLoadingData(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (!isAuthLoading && user) {
        fetchSubmission();
    } else if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router, fetchSubmission]);
  
  const isLoading = isAuthLoading || isLoadingData;
  
  if (isLoading || !submission || submission?.finalCodeStatus !== 'approved') {
      return (
          <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
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
