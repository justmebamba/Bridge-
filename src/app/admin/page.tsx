
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getSubmissions } from '@/lib/submission-data';
import { getAdmins } from '@/lib/admin-data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    redirect('/admin/login');
  }

  const currentUser = session.user;
  const isMainAdmin = currentUser.isMainAdmin;

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
