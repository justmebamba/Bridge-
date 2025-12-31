
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // The session check has been removed as per the new requirements.
    // The admin dashboard is now publicly accessible but at a non-obvious URL.
    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
