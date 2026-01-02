
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import type { AdminUser } from '@/lib/types';
import { getAdminById } from '@/lib/data-access';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const pathname = headers().get('x-next-pathname') || '';
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');
    
    // If user is NOT logged in and is NOT on an auth page, redirect to login.
    // This is the primary server-side protection.
    if (!session.admin && !isAuthPage) {
        redirect('/admin/login');
    }

    let currentUser: Omit<AdminUser, 'passwordHash'> | null = null;
    
    if (session.admin?.id) {
        currentUser = await getAdminById(session.admin.id);
        // If user exists in session but not in DB, destroy session and redirect.
        if (!currentUser) {
            await session.destroy();
            redirect('/admin/login');
        }
    }

    // If user IS logged in and tries to access an auth page, redirect to the dashboard.
    if (currentUser && isAuthPage) {
        redirect('/management-portal-a7b3c9d2e1f0');
    }

    // If on an auth page and not logged in, render the login/signup form directly.
    if (isAuthPage) {
         return (
             <main className="flex min-h-screen flex-col items-center justify-center">
                 {children}
            </main>
        );
    }
    
    // If user is logged in, show the full admin dashboard layout.
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
