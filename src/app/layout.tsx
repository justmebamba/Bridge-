
'use client';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TikTokBridgeForm } from '@/components/tiktok-bridge-form';
import { TikTokBridgeHero } from '@/components/tiktok-bridge-hero';
import { usePathname } from 'next/navigation';


const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <SiteHeader onGetStarted={() => setIsFormOpen(true)} />
            {isHomePage && <TikTokBridgeHero onGetStarted={() => setIsFormOpen(true)} />}
            <main className="flex-1">
              {children}
            </main>
            <div className="bg-background rounded-t-2xl md:rounded-t-3xl -mt-4 md:-mt-6 relative z-10">
                <SiteFooter />
            </div>
          </div>
        </FirebaseClientProvider>
        <Toaster />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-lg">
            <TikTokBridgeForm onFinished={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </body>
    </html>
  );
}
