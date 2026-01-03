'use client';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { usePathname } from 'next/navigation';
import { TikTokBridgeHero } from '@/components/tiktok-bridge-hero';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { useState, useEffect } from 'react';
import { Loader } from '@/components/loader';


const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAdminPage = pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup');
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // This timer is just for the initial aesthetic loading effect.
    // It will reliably remove the loader.
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 150); // Start fading out quickly

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 650); // Remove loader after fade-out animation (0.5s)

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  if (isAdminPage) {
    return (
       <html lang="en" suppressHydrationWarning>
        <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
          {children}
          <Toaster />
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {isLoading && <Loader isFadingOut={isFadingOut} />}
          <div className="relative flex min-h-dvh flex-col bg-background">
            <SiteHeader />
            {isHomePage && <TikTokBridgeHero />}
            <main className="flex-1">
              {children}
            </main>
            <div className="bg-background rounded-t-2xl md:rounded-t-3xl -mt-4 md:-mt-6 relative z-10">
                <SiteFooter />
            </div>
          </div>
          <CookieConsentBanner />
        <Toaster />
      </body>
    </html>
  );
}
