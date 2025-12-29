
'use client';

import { cn } from '@/lib/utils';

interface LoaderProps {
  isFadingOut: boolean;
}

export function Loader({ isFadingOut }: LoaderProps) {
  return (
    <div
      className={cn(
        "loader-wrapper",
        isFadingOut && "fade-out"
      )}
    >
      <div className="tiktok-loader">
        <div className="dot cyan"></div>
        <div className="dot red"></div>
      </div>
    </div>
  );
}
