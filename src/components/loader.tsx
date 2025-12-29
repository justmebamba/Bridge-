
'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  isFadingOut: boolean;
}

export function Loader({ isFadingOut }: LoaderProps) {
  return (
    <div
      className={cn(
        "loader-wrapper fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500",
        isFadingOut && "fade-out"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Application...</p>
      </div>
    </div>
  );
}
