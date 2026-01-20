
'use client';

import { CheckCircle, PartyPopper, Loader2, LogOut, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthUser, Submission } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function SuccessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user-session');
    if (sessionUser) {
      const parsedUser: AuthUser = JSON.parse(sessionUser);
      setUsername(parsedUser.id);
      
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/submissions?id=${parsedUser.id}`);
          if (res.ok) {
            const submission: Submission = await res.json();
            if (submission.finalCodeStatus === 'approved' || submission.isVerified) {
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
  
  const handleNewSession = () => {
    sessionStorage.removeItem('user-session');
    router.push('/start');
  };

  if (isLoading || !isAllowed) {
      return (
          <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-tiktok-pink to-tiktok-cyan mb-4 shadow-lg">
                <PartyPopper className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold tracking-tighter">
                You're All Set!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
                Welcome to the club{username ? `, @${username}` : ''}!
            </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
            <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p>
                    Your account is now fully bridged and your application has been approved.
                </p>
                <p>
                    Your <span className="font-semibold text-foreground">$300 bridging bonus</span> has been processed. You should see it reflected on your account shortly. For any questions, feel free to <Link href="/#contact" className="underline text-primary">contact us</Link>.
                </p>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 p-8 bg-muted/40 border-t">
            <Button asChild size="lg" className="w-full rounded-full text-base font-semibold">
                <Link href="/">Return to Homepage</Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground h-8 w-8 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={handleNewSession} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Start New Session
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardFooter>
      </Card>
    </main>
  );
}
