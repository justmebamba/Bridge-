
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminUser } from '@/lib/types';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
        // If user is not logged in and not on an auth page, redirect to login.
        if (!currentUser && !isAuthPage) {
            router.replace('/admin/login');
        }

        // If user is logged in and tries to access an auth page, redirect to dashboard.
        if (currentUser && isAuthPage) {
            router.replace('/admin');
        }
    }, [currentUser, isAuthPage, router, pathname]);

    // Render a loading state or null while redirecting to prevent flash of wrong content
    if ((!currentUser && !isAuthPage) || (currentUser && isAuthPage)) {
        return null; // Or a loading spinner
    }

    return (
        <SidebarProvider>
            {!isAuthPage && (
              <Sidebar>
                  <AdminSidebar currentUser={currentUser} />
              </Sidebar>
            )}
            <SidebarInset>
                 <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-6">
                     <div className="flex-1">
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                     {isAuthPage && !currentUser && (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </Link>
                        </Button>
                    )}
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
