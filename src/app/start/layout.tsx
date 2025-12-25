
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SubmissionProvider } from '@/hooks/use-submission-context';

export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return (
            <div className="container flex items-center justify-center py-16 md:py-24">
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-xl font-semibold">Loading User Session</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <SubmissionProvider>
            <div id="get-started" className="py-16 md:py-24 bg-background">
                <div className="container flex items-center justify-center">
                    {children}
                </div>
            </div>
        </SubmissionProvider>
    );
}
