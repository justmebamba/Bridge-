
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { getAdminById } from '@/lib/data-access';
import { headers } from 'next/headers';
import type { AdminUser } from '@/lib/types';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const admin = session.admin;
    const pathname = headers().get('x-next-pathname') || '';
    
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    if (!admin && !isAuthPage) {
        redirect('/admin/login');
    }

    if (admin && isAuthPage) {
        redirect('/admin');
    }
    
    let currentUser: Omit<AdminUser, 'passwordHash'> | null = null;
    if (admin) {
        // This check prevents the crash. We only fetch the user if the admin session exists.
        currentUser = await getAdminById(admin.id);
    }
    
    return (
        <AdminLayoutClient currentUser={currentUser}>
            {children}
        </AdminLayoutClient>
    );
}
