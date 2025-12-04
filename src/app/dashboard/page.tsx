'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Landmark, Loader2, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'tiktok_users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
    if (!isProfileLoading && userProfile === null) {
      // If the user is logged in but has no profile, they haven't completed the flow.
      router.push('/');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);
  
  if (isUserLoading || isProfileLoading || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <Landmark className="h-16 w-16 text-primary" />
          <h1 className="text-3xl font-bold tracking-tighter text-center font-headline">Your Dashboard</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            Welcome to your monetization bridge!
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
    </main>
  );
}
