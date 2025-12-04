import Link from "next/link"
import { TikTokForBusinessLogo } from "../icons/tiktok-for-business-logo"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <TikTokForBusinessLogo className="h-7 fill-foreground" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">Features</Link>
            <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">Pricing</Link>
            <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">Support</Link>
            <Link href="/login" className="text-foreground/60 transition-colors hover:text-foreground/80">Admin</Link>
        </nav>

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
                        <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold">Features</Link>
                        <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold">Pricing</Link>
                        <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold">Support</Link>
                        <Link href="/login" className="flex w-full items-center py-2 text-lg font-semibold">Admin</Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      </div>
    </header>
  )
}
