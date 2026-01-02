
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminUser } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminLayoutClient({
    children,
    currentUser
}: {
    children: React.ReactNode;
    currentUser: Omit<AdminUser, 'passwordHash'> | null;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');
    
    useEffect(() => {
        // If user is logged in BUT is on an auth page, redirect them to the dashboard.
        if (currentUser && isAuthPage) {
            router.replace('/admin');
            return;
        }

        // If user is NOT logged in and is NOT on an auth page, send them to login.
        if (!currentUser && !isAuthPage) {
            router.replace('/admin/login');
            return;
        }

    }, [currentUser, isAuthPage, router]);

    // Render a loading state while redirecting to prevent flash of wrong content
    if ((currentUser && isAuthPage) || (!currentUser && !isAuthPage)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // If we're on an authentication page (and the user is logged out), show children without the full layout.
    if (isAuthPage) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center">
                 {children}
            </main>
        );
    }

    // Otherwise, show the full admin dashboard layout for a logged-in user.
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar currentUser={currentUser} />
            </Sidebar>
            <SidebarInset>
                 <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-6">
                     <div className="flex-1">
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
