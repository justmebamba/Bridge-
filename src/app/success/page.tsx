
'use client';

import { CheckCircle, Clock, DollarSign, LogOut, MoreHorizontal, Rocket, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthUser, Submission } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { OnboardingGuideModal } from '@/components/success/onboarding-guide-modal';


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
          <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 p-4">
              <svg className="w-16 h-16 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          </div>
      )
  }

  return (
    <>
      <OnboardingGuideModal />
      <main className="min-h-dvh bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tiktok-cyan/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>

        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Rocket className="w-12 h-12 text-green-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Connection Successful!</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          Your account {username ? <span className="font-bold text-white">@{username}</span> : ''} is now bridged to the US Monetization Network. You’re officially ready to start earning.
        </p>

        <Card className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/30 backdrop-blur-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Your $300 Kickstart Bonus</span>
            <span className="text-green-400 font-bold text-lg">$300.00</span>
          </div>
          <Progress value={5} className="h-3 bg-slate-700" />
          <p className="text-xs text-slate-500 mt-3">Generate your first 100,000 qualified views to unlock. Our system syncs every 24 hours to update your progress.</p>
        </Card>
        
        <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-black/30 backdrop-blur-sm mb-8">
          <h2 className="text-lg font-semibold text-center mb-4">What's Next?</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Account Bridged</span>
                <p className="text-slate-400">Your Dedicated IP is active.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }}/>
              <div>
                <span className="font-semibold">Verification</span>
                <p className="text-slate-400">Our team is filing your agency paperwork (24-48 hours).</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Start Posting</span>
                <p className="text-slate-400">Use the "Bridge Instructions" in the welcome pop-up to log in safely.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">First Payout</span>
                <p className="text-slate-400">Once you hit the $50 threshold, the 'Withdraw' button will activate.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <Button asChild size="lg" className="w-full rounded-full text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
              <Link href="/">Return to Homepage</Link>
          </Button>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-500 hover:text-slate-300 h-8 w-8 p-0">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">More options</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuItem onClick={handleNewSession} className="text-red-400 focus:text-red-300 focus:bg-slate-700 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Start New Session
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </main>
    </>
  );
}
