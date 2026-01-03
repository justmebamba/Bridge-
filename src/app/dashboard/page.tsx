
import type { Submission, AdminUser } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdmins, getSubmissions } from '@/lib/data-access';

export default async function DashboardPage() {
    const [submissions, admins] = await Promise.all([
        getSubmissions(),
        getAdmins(),
    ]);
    
    return (
        <AdminDashboard 
            initialSubmissions={submissions}
        />
    );
}
