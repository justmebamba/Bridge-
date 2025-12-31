
import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import prisma from '@/lib/prisma';

// Server-side data fetching functions
async function getSubmissions(): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    // Ensure createdAt is a string for serialization
    return submissions.map(s => ({...s, createdAt: s.createdAt.toISOString()}));
}

async function getAdmins(): Promise<Omit<AdminUser, 'passwordHash'>[]> {
    const admins = await prisma.admin.findMany({
        select: {
            id: true,
            email: true,
            isMainAdmin: true,
            isVerified: true,
            createdAt: true,
        }
    });
     // Ensure createdAt is a string for serialization
    return admins.map(a => ({...a, createdAt: a.createdAt.toISOString()}));
}

export default async function AdminPage() {
    // Fetch all data on the server
    const [submissions, admins] = await Promise.all([
        getSubmissions(),
        getAdmins()
    ]);
    
    // For now, we'll mock a "current user" since there is no login.
    // We'll assume the person accessing this is the main admin.
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
