
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
        // Only run logic after the initial auth check is complete.
        if (!checked) {
            return;
        }

        // If check is complete and there's no Firebase user, redirect to login.
        if (!firebaseUser) {
            router.replace('/admin/login');
            return;
        }
        
        // If there is a firebase user but no verified adminUser object, it means
        // they are either not in the admin list or not verified.
        if (firebaseUser && !adminUser?.isVerified) {
             router.replace('/admin/login');
        }
        // If they are logged in and verified, they can stay.

    }, [checked, firebaseUser, adminUser, router]);

    // Show a loader until the auth state is fully checked and confirmed.
    // Also show loader if we are in the process of redirecting.
    if (!checked || !firebaseUser || !adminUser?.isVerified) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <Loader isFadingOut={false} />
            </div>
        );
    }
    
    // Once everything is confirmed, render the main layout.
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
