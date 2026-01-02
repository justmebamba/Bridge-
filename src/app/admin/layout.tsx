
import { getSession } from '@/lib/session';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { getAdminById } from '@/lib/data-access';
import type { AdminUser } from '@/lib/types';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const admin = session.admin;
    
    let currentUser: Omit<AdminUser, 'passwordHash'> | null = null;
    
    // This logic is now safer. We only attempt to fetch a user if a session exists.
    if (admin?.id) {
        currentUser = await getAdminById(admin.id);
        // If the user was deleted from the db but the session remains, destroy it.
        // The client component will handle the redirect.
        if (!currentUser) {
            session.destroy();
        }
    }
    
    // The client component will now handle all redirection logic based on the user's status.
    // We pass `undefined` initially if the user is not found, letting the client component show a loading state.
    return (
        <AdminLayoutClient currentUser={currentUser}>
            {children}
        </AdminLayoutClient>
    );
}
