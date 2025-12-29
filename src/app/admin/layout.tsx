import { getSession } from '@/lib/session';
import { redirect, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader } from '@/components/loader';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const pathname = headers().get('next-url') || '';

    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

    // If on a protected page and not logged in or not verified, redirect to login
    if (!isAuthPage && (!session.isLoggedIn || !session.user?.isVerified)) {
        redirect('/admin/login');
    }
    
    // If on an auth page but already logged in and verified, redirect to dashboard
    if (isAuthPage && session.isLoggedIn && session.user?.isVerified) {
        redirect('/admin');
    }

    // For login/signup pages, just render the children without the sidebar layout
    if (isAuthPage) {
        return <>{children}</>;
    }
    
    // For protected pages, render the full admin dashboard layout
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar user={session.user} />
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
