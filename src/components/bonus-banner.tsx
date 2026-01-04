'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Gift, X } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

export function BonusBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Use useEffect to trigger the animation on mount
  useEffect(() => {
    // This code only runs on the client
    const hasBeenDismissed = sessionStorage.getItem('bonus_banner_dismissed');
    if (hasBeenDismissed !== 'true') {
      const timer = setTimeout(() => setIsVisible(true), 500); // Delay for effect
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('bonus_banner_dismissed', 'true');
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-transform duration-500 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <Card className="max-w-4xl mx-auto shadow-2xl bg-gradient-to-br from-[#1a0033] to-[#4A00E0] text-white border-purple-400/30 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-grid-pattern"
          style={{
            backgroundSize: '30px 30px',
            backgroundImage:
              'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
          }}
        />
        <div className="absolute top-0 right-0 p-2">
            <button
                type="button"
                className="p-2 text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-full"
                onClick={handleDismiss}
                >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" aria-hidden="true" />
            </button>
        </div>
        <CardContent className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-tiktok-pink to-tiktok-cyan flex-shrink-0">
                <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-yellow-300">Limited Time: $300 Bridging Bonus!</h3>
              <p className="text-sm text-white/80 mt-1">
                Bridge your account today to unlock US monetization features like the Creator Fund and TikTok Shop, and claim your bonus.
              </p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-tiktok-pink to-tiktok-cyan text-white font-bold border-0 hover:opacity-90 transition-opacity rounded-full px-6 py-3">
              <Link href="/start">
                Claim Your Bonus
              </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
