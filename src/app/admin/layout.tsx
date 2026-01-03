
'use client';

import type { AdminUser } from '@/lib/types';
import { getAdminById } from '@/lib/data-access';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useRouter, usePathname } from 'next/navigation';
import { headers } from 'next/headers';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// This is a client component, so we fetch the user session on the client.
// The middleware has already protected the route.

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<Omit<AdminUser, 'passwordHash'> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    useEffect(() => {
        // This function runs only on the client
        async function checkSessionAndFetchUser() {
            if (isAuthPage) {
                setIsLoading(false);
                return;
            }

            try {
                // We fetch the session from a client-side API route.
                const res = await fetch('/api/auth/session');
                
                if (!res.ok) {
                    // If session is invalid/expired, redirect to login
                    router.replace('/admin/login');
                    return;
                }
                
                const data = await res.json();
                
                if (!data.admin) {
                     // No admin in session, redirect
                     router.replace('/admin/login');
                     return;
                }
                
                setUser(data.admin);

            } catch (error) {
                console.error("Session check failed", error);
                router.replace('/admin/login');
            } finally {
                setIsLoading(false);
            }
        }

        checkSessionAndFetchUser();

    }, [pathname, router, isAuthPage]);


    if (isAuthPage) {
         return (
             <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
                 {children}
            </main>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // This is a fallback while redirecting
        return (
             <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
        );
    }

    // Render the full admin dashboard layout.
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar currentUser={user} />
            </Sidebar>
            <SidebarInset>
                 <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-6">
                     <div className="flex-1">
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
