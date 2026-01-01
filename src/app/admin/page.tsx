
import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions, getAdminById } from '@/lib/data-access';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


export default async function AdminPage() {
    const session = await getSession();
    if (!session.admin) {
        redirect('/admin/login');
    }

    // Fetch all data on the server
    const [submissions, admins, currentUser] = await Promise.all([
        getSubmissions(),
        getAdmins(),
        getAdminById(session.admin.id)
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
