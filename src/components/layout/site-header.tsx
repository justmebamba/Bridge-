
'use client';

import Link from "next/link"
import { TikTokLogo } from "../icons/tiktok-logo"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/types";

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // This effect should only run once on the client after hydration
    const storedUser = sessionStorage.getItem('user-session');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    const handleStorageChange = () => {
        const storedUser = sessionStorage.getItem('user-session');
        setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event to handle changes within the same tab
    window.addEventListener('session-changed', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('session-changed', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user-session');
    setUser(null);
    window.dispatchEvent(new Event('session-changed'));
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <TikTokLogo className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">
              Monetization Bridge
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/#features" className="text-foreground/60 transition-colors hover:text-foreground/80">Features</Link>
            <Link href="/#about" className="text-foreground/60 transition-colors hover:text-foreground/80">About</Link>
            <Link href="/#contact" className="text-foreground/60 transition-colors hover:text-foreground/80">Contact Us</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
                <div className="flex items-center gap-4">
                    <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
                    <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                </div>
            ) : user ? (
                <>
                    <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
                    <Button asChild>
                        <Link href="/start">My Account</Link>
                    </Button>
                </>
            ) : (
                 <>
                    <Button variant="ghost" asChild>
                        <Link href="/start">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/start">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>

        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <div className="grid gap-4 py-6">
                        <Link href="/#features" className="flex w-full items-center py-2 text-lg font-semibold">Features</Link>
                        <Link href="/#about" className="flex w-full items-center py-2 text-lg font-semibold">About</Link>
                        <Link href="/#contact" className="flex w-full items-center py-2 text-lg font-semibold">Contact Us</Link>
                        <hr className="my-2"/>
                         {isLoading ? (
                            <div className="grid gap-4">
                                <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
                                <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
                            </div>
                         ) : user ? (
                            <>
                                <Button onClick={handleLogout} variant="secondary">Log Out</Button>
                                <Button asChild size="lg"><Link href="/start">My Account</Link></Button>
                            </>
                        ) : (
                           <>
                             <Button asChild variant="ghost" size="lg"><Link href="/start">Log In</Link></Button>
                             <Button asChild size="lg"><Link href="/start">Sign Up</Link></Button>
                           </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      </div>
    </header>
  )
}
