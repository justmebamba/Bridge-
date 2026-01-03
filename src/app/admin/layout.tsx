
import type { AdminUser } from '@/lib/types';
import { getAdminById } from '@/lib/data-access';
import { getSession } from '@/lib/session';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = headers().get('x-next-pathname') || '';
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If on an auth page, render the form directly without the dashboard shell.
    // The middleware has already ensured that a logged-in user can't see this.
    if (isAuthPage) {
         return (
             <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
                 {children}
            </main>
        );
    }
    
    // For all other admin pages, we can assume the user is logged in
    // because the middleware has already protected this route.
    const session = await getSession();

    // As a safety net, if the session is somehow missing, redirect.
    // This should theoretically not be reached due to middleware.
    if (!session.admin?.id) {
        redirect('/admin/login');
    }

    const currentUser = await getAdminById(session.admin.id);
    
    // If user was deleted from DB but session persists, destroy session & redirect.
    if (!currentUser) {
        await session.destroy();
        redirect('/admin/login');
    }

    // Render the full admin dashboard layout.
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
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
