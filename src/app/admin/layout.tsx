
import { getSession } from '@/lib/session';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { getAdminById } from '@/lib/data-access';
import type { AdminUser } from '@/lib/types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const admin = session.admin;
    const pathname = headers().get('x-next-pathname') || '';
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If user is NOT logged in and is NOT on an auth page, redirect to login.
    // This is the primary server-side protection.
    if (!admin && !isAuthPage) {
        redirect('/admin/login');
    }
    
    let currentUser: Omit<AdminUser, 'passwordHash'> | null = null;
    
    if (admin?.id) {
        currentUser = await getAdminById(admin.id);
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
    
    // Pass user data to the client, which now only handles UI.
    return (
        <AdminLayoutClient currentUser={currentUser}>
            {children}
        </AdminLayoutClient>
    );
}
