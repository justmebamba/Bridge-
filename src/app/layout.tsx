
'use client';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { usePathname } from 'next/navigation';
import { TikTokBridgeHero } from '@/components/tiktok-bridge-hero';
import { useRouter } from 'next/navigation';


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
  const router = useRouter();
  const isHomePage = pathname === '/';

  const handleGetStarted = () => {
    if (isHomePage) {
      document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#get-started');
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <SiteHeader onGetStarted={handleGetStarted} />
            {isHomePage && <TikTokBridgeHero onGetStarted={handleGetStarted} />}
            <main className="flex-1">
              {children}
            </main>
            <div className="bg-background rounded-t-2xl md:rounded-t-3xl -mt-4 md:-mt-6 relative z-10">
                <SiteFooter />
            </div>
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
