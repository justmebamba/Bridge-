
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar />
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
