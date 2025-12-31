
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { AdminUser } from '@/lib/types';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const pathname = headers().get('next-url') || '';

    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

    if (isAuth-page) {
        if (session.isLoggedIn && session.user?.isVerified) {
            redirect('/admin');
        }
        return <>{children}</>;
    }

    if (!session.isLoggedIn || !session.user?.isVerified) {
        redirect('/admin/login');
    }
    
    // For protected pages, render the full admin dashboard layout.
    // The session user is passed to the client component.
    return (
        <AdminLayoutClient user={session.user}>
            {children}
        </AdminLayoutClient>
    );
}
