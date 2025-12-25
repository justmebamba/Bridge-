
'use client';

import { CheckCircle, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PartyPopper className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Submission Complete!</CardTitle>
          <CardDescription>
            Thank you for submitting your information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-muted-foreground text-sm text-center max-w-xs">
                While there is no backend to process this submission, this confirms the form flow is complete.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
