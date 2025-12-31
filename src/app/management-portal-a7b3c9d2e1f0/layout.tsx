
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

    const isAuthPage = pathname === '/management-portal-a7b3c9d2e1f0/login' || pathname === '/management-portal-a7b3c9d2e1f0/signup';

    if (isAuthPage) {
        if (session.isLoggedIn && session.user?.isVerified) {
            redirect('/management-portal-a7b3c9d2e1f0');
        }
        return <>{children}</>;
    }

    if (!session.isLoggedIn || !session.user?.isVerified) {
        redirect('/management-portal-a7b3c9d2e1f0/login');
    }
    
    // For protected pages, render the full admin dashboard layout.
    // The session user is passed to the client component.
    return (
        <AdminLayoutClient user={session.user}>
            {children}
        </AdminLayoutClient>
    );
}
