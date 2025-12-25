
'use client';

import { AdminAuthWrapper } from '@/hooks/use-admin-auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // The AdminAuthWrapper provides the context needed for useAdminAuth hook
    // which is used by child pages and the protected layout logic.
    return (
        <AdminAuthWrapper>
            {children}
        </AdminAuthWrapper>
    );
}
