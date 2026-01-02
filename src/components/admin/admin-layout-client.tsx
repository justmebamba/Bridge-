
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminUser } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AdminLayoutClient({
    children,
    currentUser
}: {
    children: React.ReactNode;
    currentUser: Omit<AdminUser, 'passwordHash'> | null;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If the user is logged out and on an auth page, render the form directly without the sidebar layout.
    if (!currentUser && isAuthPage) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center">
                 {children}
            </main>
        );
    }
    
    // If the user is logged in, show the full admin dashboard layout.
    // The server-side layout has already handled all redirection logic.
    if (currentUser) {
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

    // Fallback loading state while server components resolve.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}
