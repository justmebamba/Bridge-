
import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions } from '@/lib/data-access';


export default async function AdminPage() {
    // Fetch all data on the server from JSON files
    const [submissions, admins] = await Promise.all([
        getSubmissions(),
        getAdmins()
    ]);
    
    // Since there's no login, we'll find the main admin from the data
    const currentUser = admins.find(a => a.isMainAdmin) || admins[0] || null;
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
