
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
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
    const pathname = usePathname();
    
    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

    useEffect(() => {
        if (!checked) {
            return; // Wait for auth check to complete
        }

        // If on a protected page (not login/signup) and not verified, redirect to login
        if (!isAuthPage && !adminUser?.isVerified) {
            router.replace('/admin/login');
            return;
        }
        
        // If on an auth page (login/signup) but already verified, redirect to dashboard
        if (isAuthPage && adminUser?.isVerified) {
            router.replace('/admin');
            return;
        }

    }, [checked, firebaseUser, adminUser, router, isAuthPage, pathname]);

    // Show a loader while auth state is being checked, or if on a protected page without verification
    if (!checked || (!isAuthPage && !adminUser?.isVerified)) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <Loader isFadingOut={false} />
            </div>
        );
    }
    
    // For login/signup pages, just render the children without the sidebar layout
    if (isAuthPage) {
        return <>{children}</>;
    }
    
    // For protected pages, render the full admin dashboard layout
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
