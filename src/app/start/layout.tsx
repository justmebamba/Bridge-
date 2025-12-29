
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, checked } = useAuth(); // Use the new 'checked' flag
    const router = useRouter();

    // The logic to redirect if not logged in is now removed from here.
    // The /start page itself will handle both authenticated and unauthenticated users.

    // Show a loading screen until the initial authentication check is complete.
    if (!checked) {
        return (
            <div className="container flex items-center justify-center py-16 md:py-24">
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-xl font-semibold">Loading Session</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="get-started" className="py-16 md:py-24 bg-background">
            <div className="container flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
