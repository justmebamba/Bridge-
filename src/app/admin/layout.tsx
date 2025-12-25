
'use client';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAdmin, isLoading } = useAdminAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying admin access...</p>
                </div>
            </div>
        )
    }
    
    // The child pages will handle the redirect if user is null or not an admin
    // This layout just provides the context.
    return <>{children}</>;
}
