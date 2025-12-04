'use client';

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { TikTokLogo } from "@/components/icons/tiktok-logo";

export default function DashboardPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  useEffect(() => {
    if (!submissionId) {
      router.push('/');
    }
  }, [submissionId, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!submissionId || !firestore) return null;
    return doc(firestore, 'tiktok_users', submissionId);
  }, [firestore, submissionId]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  if (isProfileLoading || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!userProfile.isVerified) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('submissionId', submissionId as string);
    }
    router.push('/waiting-for-approval');
    return null;
  }

  return (
    <div className="container flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <TikTokLogo className="h-16 w-16" />
          <h1 className="text-3xl font-bold tracking-tighter text-center">Your Dashboard</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            Welcome! Your account is approved and ready.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your linked account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">TikTok Username</p>
                <p className="font-semibold">@{userProfile.tiktokUsername}</p>
              </div>
            </div>
             <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Linked US Number</p>
                <p className="font-semibold">{userProfile.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
