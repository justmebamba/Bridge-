
import type { Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions, getAdminById } from '@/lib/data-access';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


export default async function AdminPage() {
    const session = await getSession();
    // Middleware protects this route, but we still need to fetch server-side data.
    // A server-side check adds another layer of security.
    if (!session.admin?.id) {
        redirect('/admin/login');
    }

    const currentUser = await getAdminById(session.admin.id);
    
    // If the user was deleted from the db but the session remains,
    // the middleware/layout will handle the client-side redirect.
    // We check here again to prevent rendering with a stale user.
    if (!currentUser) {
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
        <AdminDashboard 
            initialSubmissions={submissions}
            initialAdmins={admins}
            currentUser={currentUser}
            isMainAdmin={isMainAdmin}
        />
    );
}
