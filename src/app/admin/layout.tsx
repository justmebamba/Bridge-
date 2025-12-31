
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const pathname = headers().get('next-url') || '';

    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';
    const isLoggedInAndVerified = session.isLoggedIn && session.user?.isVerified;

    // For login/signup pages, just render the children without the sidebar layout.
    if (isAuthPage) {
        // If they are already logged in, redirect them away from the auth pages
        if (isLoggedInAndVerified) {
            redirect('/admin');
        }
        // Otherwise, show the login/signup page.
        return <>{children}</>;
    }
    
    // At this point, we are on a protected page.
    // If the user is not logged in and verified, redirect them to the login page.
    if (!isLoggedInAndVerified) {
        redirect('/admin/login');
    }
    
    // For protected pages, render the full admin dashboard layout.
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
