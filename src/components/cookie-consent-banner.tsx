
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This code only runs on the client
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Cookie Preferences</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We use cookies to enhance your browsing experience and ensure our services function correctly. By clicking "Accept", you agree to our use of cookies. Read our{' '}
                <Link href="#" className="underline hover:text-primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
          <Button onClick={handleAccept} className="w-full sm:w-auto flex-shrink-0">
            Accept
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
