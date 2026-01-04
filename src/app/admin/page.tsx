

import type { Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getSubmissions } from '@/lib/data-access';

export default async function AdminPage() {
    // Fetch all data on the server
    const submissions = await getSubmissions();
    
    // Pass the fetched data as props to the client component
    return (
        <AdminDashboard 
            initialSubmissions={submissions}
        />
    );
}
