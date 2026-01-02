
import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions, getAdminById } from '@/lib/data-access';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


export default async function AdminPage() {
    const session = await getSession();
    if (!session.admin?.id) {
        // This is a critical safety check. If for any reason the session is gone,
        // or doesn't have an ID, redirect to login.
        redirect('/admin/login');
    }

    const currentUser = await getAdminById(session.admin.id);
    
    // This check is important. If the user was deleted from the db but the session remains,
    // we should not proceed. Destroy the session and redirect.
    if (!currentUser) {
        await session.destroy();
        redirect('/admin/login');
    }

    // Fetch all data on the server now that we know we have a valid user
    const [submissions, admins] = await Promise.all([
        getSubmissions(),
        getAdmins(),
    ]);
    
    const isMainAdmin = !!currentUser?.isMainAdmin;

    // Pass the fetched data as props to the client component
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <AdminDashboard 
                initialSubmissions={submissions}
                initialAdmins={admins}
                currentUser={currentUser}
                isMainAdmin={isMainAdmin}
            />
        </main>
    );
}
