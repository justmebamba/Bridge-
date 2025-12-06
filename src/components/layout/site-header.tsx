
import Link from "next/link"
import { TikTokLogo } from "../icons/tiktok-logo"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

export function SiteHeader({ onGetStarted }: { onGetStarted: () => void }) {
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
            <Link href="/#contact" className="text-foreground/60 transition-colors hover:text-foreground/80">Support</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
            <Button asChild>
                <Link href="/#get-started" onClick={(e) => { e.preventDefault(); onGetStarted();}}>Get Started</Link>
            </Button>
            <Link href="/login" className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80">Admin</Link>
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
                        <Link href="/#contact" className="flex w-full items-center py-2 text-lg font-semibold">Support</Link>
                        <hr className="my-2"/>
                        <Button onClick={onGetStarted} size="lg">Get Started</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      </div>
    </header>
  )
}
