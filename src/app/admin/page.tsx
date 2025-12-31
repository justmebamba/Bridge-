
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getSubmissions } from '@/lib/submission-data';
import { JsonStore } from '@/lib/json-store';

// This function is now co-located with the Server Component
async function getAdmins() {
  const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);
  const admins = await store.read();
  // Ensure password hashes are not returned
  const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
  return safeAdmins;
}


export default async function AdminPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user?.isVerified) {
    redirect('/admin/login');
  }

  const currentUser = session.user;
  const isMainAdmin = !!currentUser.isMainAdmin;

  // Fetch data directly within the Server Component
  const [submissions, admins] = await Promise.all([
    getSubmissions(),
    getAdmins(),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AdminDashboard 
            submissions={submissions}
            admins={admins}
            currentUser={currentUser}
            isMainAdmin={isMainAdmin}
        />
    </main>
  );
}
