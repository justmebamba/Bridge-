import Link from "next/link";
import { Facebook } from "lucide-react";
import { TikTokLogo } from "@/components/icons/tiktok-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-12 md:px-8 md:py-16", className)}>
      <div className="container">
        <div className="flex flex-col items-start gap-8">
          <TikTokLogo className="h-7 w-7 text-foreground" />
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Terms & Policies
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Help
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
              Follow Us <Facebook className="h-4 w-4" />
            </Link>
          </div>

          <Button variant="outline" className="rounded-full">
            English
          </Button>
        </div>
      </div>
    </footer>
  );
}
