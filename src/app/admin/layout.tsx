
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader } from '@/components/loader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { adminUser, firebaseUser, isLoading, checked } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!checked) return; // Do nothing until auth state is checked

        if (!firebaseUser) {
            router.replace('/admin/login');
        }
        if (firebaseUser && !adminUser?.isVerified) {
             // This case handles a signed in but unverified user.
             // We can keep them on a page that might show a "pending approval" message,
             // but redirect from the main dashboard.
             // For now, let's redirect to login and let the login page show the error.
             router.replace('/admin/login');
        }
    }, [checked, firebaseUser, adminUser, router]);

    // Show loader until auth state is confirmed
    if (isLoading || !checked || !firebaseUser || !adminUser?.isVerified) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <Loader isFadingOut={false} />
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar />
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
                     <div className="flex-1">
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
