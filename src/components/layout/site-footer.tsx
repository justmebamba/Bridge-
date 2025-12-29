
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { TikTokForBusinessLogo } from "@/components/icons/tiktok-for-business-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-12 md:px-8 md:py-16", className)}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex flex-col items-start gap-8">
                <Link href="/" aria-label="Go to homepage">
                  <TikTokForBusinessLogo className="h-7 text-foreground" />
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
                   <Link href="/admin" className="hover:text-primary transition-colors">
                    Admin
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
                <h3 className="font-semibold text-foreground">Official TikTok Partner</h3>
                <p>
                    Our TikTok Bridging service is an official solution designed in partnership with TikTok to enable monetization features for creators in regions not yet supported by the TikTok Creator Fund or TikTok Shop. We provide a legitimate, US-based phone number for verification purposes.
                </p>
                <p>
                    Use of this service is subject to TikTok's terms of service and policies. As an official partner, we guarantee eligibility and account safety for all approved creators.
                </p>
             </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TikTok Monetization Bridge. An Official TikTok Partner.</p>
        </div>
      </div>
    </footer>
  );
}
