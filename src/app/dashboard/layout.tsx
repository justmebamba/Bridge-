
import type { AdminUser } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAdminById } from '@/lib/data-access';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    
    if (!session.admin?.id) {
        redirect('/login');
    }

    const user = await getAdminById(session.admin.id);

    if (!user) {
        // This could happen if the user was deleted but the session still exists.
        // Destroy the session and redirect to login.
        await session.destroy();
        redirect('/login');
    }

    // Pass the user to children that need it
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { currentUser: user });
        }
        return child;
    });

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
                <main className="flex-1 p-4 md:p-6">{childrenWithProps}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
