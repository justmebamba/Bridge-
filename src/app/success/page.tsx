
'use client';

import { CheckCircle, PartyPopper, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthUser, Submission } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user-session');
    if (sessionUser) {
      const parsedUser: AuthUser = JSON.parse(sessionUser);
      
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/submissions?id=${parsedUser.id}`);
          if (res.ok) {
            const submission: Submission = await res.json();
            if (submission.finalCodeStatus === 'approved') {
              setIsAllowed(true);
            } else {
              router.replace('/start');
            }
          } else {
             router.replace('/start');
          }
        } catch (error) {
          router.replace('/start');
        } finally {
          setIsLoading(false);
        }
      };

      checkStatus();

    } else {
      router.replace('/start');
    }
  }, [router]);
  
  if (isLoading || !isAllowed) {
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
