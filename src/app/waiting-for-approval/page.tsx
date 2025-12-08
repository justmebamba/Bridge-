
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function WaitingForApprovalPage() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    // This is now the single source of truth. It reliably gets the ID from storage.
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('submissionId');
      if (id) {
        setSubmissionId(id);
      } else {
        // If no ID is found, the user shouldn't be here.
        router.replace('/');
      }
    }
  }, [router]);

  // This hook will now correctly wait for firestore and submissionId to be ready.
  const userProfileRef = useMemoFirebase(() => {
    if (!submissionId || !firestore) return null;
    return doc(firestore, 'tiktok_users', submissionId);
  }, [firestore, submissionId]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // This redirection logic is now stable because the data hooks are reliable.
    if (!isProfileLoading && userProfile) {
      if (userProfile.isVerified) {
        router.replace(`/dashboard`);
      }
    }
  }, [userProfile, isProfileLoading, router]);

  if (isProfileLoading || !submissionId) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Pending Approval</CardTitle>
          <CardDescription>
            Your account is being reviewed by an administrator. Please wait.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            This page will refresh automatically once approved.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
