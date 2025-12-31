
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminUser } from '@/lib/types';

export function AdminLayoutClient({
    user,
    children,
}: {
    user: Omit<AdminUser, 'passwordHash'>;
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar user={user} />
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
