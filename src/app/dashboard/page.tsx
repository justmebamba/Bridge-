
import type { Submission, AdminUser } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions } from '@/lib/data-access';

// The currentUser is now passed as a prop from the layout
interface DashboardPageProps {
    currentUser: Omit<AdminUser, 'passwordHash'>;
}

export default async function DashboardPage({ currentUser }: DashboardPageProps) {
    // We no longer need to fetch the user here, it's provided by the layout
    // This removes the redundant fetch and potential race conditions.
    
    // Fetch other data needed for the dashboard
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
