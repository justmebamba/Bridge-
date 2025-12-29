
'use client';

import { CheckCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import type { Submission } from '@/lib/types';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('An error occurred while fetching the data.');
    return res.json();
});

export default function SuccessPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: submission, error } = useSWR<Submission | null>(user ? `/api/submissions?id=${user.uid}` : null, fetcher);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);
  
  const isLoading = isAuthLoading || (user && submission === undefined && !error);
  
  if (isLoading) {
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
                Your application has been received and is now pending final approval from an administrator. You will be notified via email once a decision is made.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
