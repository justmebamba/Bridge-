
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
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
    
    if (admin?.id) {
        // Only fetch user if there is an admin in the session
        currentUser = await getAdminById(admin.id);
        if (!currentUser) {
            // If the user was deleted from the db but the session remains, destroy it.
            session.destroy();
            redirect('/admin/login');
        }
    }
    
    // The client component will now handle all redirection logic based on the path
    return (
        <AdminLayoutClient currentUser={currentUser}>
            {children}
        </AdminLayoutClient>
    );
}
