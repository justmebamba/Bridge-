
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { TikTokLogo } from "@/components/icons/tiktok-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-12 md:px-8 md:py-16", className)}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex flex-col items-start gap-8">
                <Link href="/" aria-label="Go to homepage">
                  <TikTokLogo className="h-7 w-7 text-foreground" />
                </Link>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted-foreground">
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
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
            </div>
             <div className="text-sm text-muted-foreground space-y-4">
                <h3 className="font-semibold text-foreground">Disclaimer</h3>
                <p>
                    Our TikTok Bridging service is a third-party solution designed to enable monetization features for creators in regions not officially supported by the TikTok Creator Fund or TikTok Shop. We provide a legitimate, US-based phone number for verification purposes only.
                </p>
                <p>
                    Eligibility for TikTok's monetization programs is subject to TikTok's own terms of service, policies, and regional availability, which may change at any time. We do not guarantee eligibility, earnings, or account safety. Users are responsible for complying with all applicable laws and TikTok's platform policies. Use of this service is at your own risk. We are not affiliated with, endorsed by, or in any way officially connected with TikTok.
                </p>
             </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TikTok Monetization Bridge. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
