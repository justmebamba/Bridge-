import { cn } from "@/lib/utils"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-6 md:px-8 md:py-8", className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by your friendly neighborhood AI. The source code is available on GitHub.
        </p>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Contact us at contact@example.com
        </p>
      </div>
    </footer>
  )
}
