
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { getAdminById } from '@/lib/data-access';
import type { AdminUser } from '@/lib/types';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const admin = session.admin;
    
    // We need to read the pathname on the server to handle redirects.
    // The middleware forwards this for us.
    const pathname = headers().get('x-next-pathname') || '';
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If user is not logged in and not on an auth page, redirect to login.
    if (!admin && !isAuthPage) {
        redirect('/admin/login');
    }

    // If user is logged in and tries to access an auth page, redirect to dashboard.
    if (admin && isAuthPage) {
        redirect('/admin');
    }
    
    let currentUser: Omit<AdminUser, 'passwordHash'> | null = null;
    // CRITICAL FIX: Only fetch the user if the admin session object exists.
    if (admin) {
        currentUser = await getAdminById(admin.id);
         // If the user was deleted from the db but the session remains, log them out.
        if (!currentUser && !isAuthPage) {
            session.destroy();
            redirect('/admin/login');
        }
    }
    
    return (
        <AdminLayoutClient currentUser={currentUser}>
            {children}
        </AdminLayoutClient>
    );
}
