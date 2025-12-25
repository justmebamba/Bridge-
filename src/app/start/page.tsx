
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now acts as a gatekeeper for the /start flow.
export default function StartPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // If user is logged in, start the flow.
                // In a real app with a database, you would check
                // their submission status and redirect to the correct step.
                // For now, we just start at the beginning.
                router.replace('/start/username');
            } else {
                // If not logged in, redirect to the login page.
                router.replace('/login');
            }
        }
    }, [isLoading, user, router]);


    // Show a loading spinner while checking auth state
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-xl font-semibold">Initializing</h1>
            <p className="text-muted-foreground">Please wait while we get things ready...</p>
        </div>
    );
}
