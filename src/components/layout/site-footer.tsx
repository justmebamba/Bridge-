
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { TikTokLogo } from "@/components/icons/tiktok-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-12 md:px-8 md:py-16", className)}>
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="flex flex-col items-start gap-8">
              <Link href="/" className="flex items-center space-x-2" aria-label="Go to homepage">
                <TikTokLogo className="h-8 w-8 text-foreground" />
                 <span className="font-bold text-xl tracking-tight">
                  Monetization Bridge
                </span>
              </Link>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                 <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
                <Link href="/#contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </div>

              <div className="flex space-x-2">
                  <Button asChild variant="outline" size="icon">
                      <Link href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                      <Link href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                      <Link href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></Link>
                  </Button>
              </div>
            </div>
             <div className="text-sm text-muted-foreground space-y-4">
                <h3 className="font-semibold text-foreground">Official TikTok Partner</h3>
                <p>
                    Our service operates under an MCN (Multi-Channel Network) agreement with TikTok. This partnership allows us to securely manage monetization features for creators in regions not yet supported by the TikTok Creator Fund or TikTok Shop, ensuring full compliance with TikTok's policies.
                </p>
                <p>
                    <strong>Data Protection:</strong> We are committed to protecting your data. All processes use secure, passwordless API protocols. We never ask for your password.
                </p>
             </div>
              <div className="text-sm text-muted-foreground space-y-4">
                <h3 className="font-semibold text-foreground">Registered Business</h3>
                <p>
                   TikTok Monetization Bridge, LLC<br/>
                   1603 Capitol Ave., Suite 413A<br/>
                   Cheyenne, WY 82001, USA
                </p>
                 <h3 className="font-semibold text-foreground mt-4">Powered By</h3>
                 <div className="flex items-center gap-4">
                    <TikTokLogo className="h-7 w-7 text-foreground" />
                 </div>
             </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TikTok Monetization Bridge, LLC. An Official TikTok MCN Partner.</p>
        </div>
      </div>
    </footer>
  );
}
