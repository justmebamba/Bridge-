
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminUser } from '@/lib/types';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';

export function AdminLayoutClient({
    children,
    currentUser
}: {
    children: React.ReactNode;
    currentUser: Omit<AdminUser, 'passwordHash'> | null;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

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
