
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
import { AuthProvider } from '@/hooks/use-auth';
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
  const isAdminPage = pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // The window.load event is not reliable in Next.js App Router.
    // Use a simple timeout to ensure the loader is always removed.
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // This second timeout should match the fade-out animation duration
      setTimeout(() => {
        setIsLoading(false);
      }, 500); 
    }, 200); // A short delay to allow initial rendering

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {isLoading && <Loader isFadingOut={isFadingOut} />}
        <AuthProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            {!isAdminPage && <SiteHeader />}
            {isHomePage && <TikTokBridgeHero />}
            <main className="flex-1">
              {children}
            </main>
            {!isAdminPage && (
              <div className="bg-background rounded-t-2xl md:rounded-t-3xl -mt-4 md:-mt-6 relative z-10">
                  <SiteFooter />
              </div>
            )}
          </div>
          <CookieConsentBanner />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
