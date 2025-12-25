
'use client';

import { CheckCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuccessPage() {
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
                Your application has been received and is now pending approval from an administrator.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
