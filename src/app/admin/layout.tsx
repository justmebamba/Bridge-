
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2, PanelLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { adminUser, isLoading, adminLogout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !adminUser) {
            router.replace('/admin/login');
        }
    }, [isLoading, adminUser, router]);

    if (isLoading || !adminUser) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                     <SidebarTrigger className="md:hidden" />
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
