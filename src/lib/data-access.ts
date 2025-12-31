
import type { Submission, AdminUser } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';

const submissionStore = new JsonStore<Submission[]>('src/data/submissions.json', []);
const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);

export async function getSubmissions(): Promise<Submission[]> {
  const submissions = await submissionStore.read();
  return submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAdmins(): Promise<AdminUser[]> {
    return await adminStore.read();
}

export async function addAdmin(email: string): Promise<AdminUser> {
    const admins = await adminStore.read();
    const hasMainAdmin = admins.some(a => a.isMainAdmin);
    
    const newAdmin = {
        id: new Date().getTime().toString(), // simple unique ID
        email,
        isMainAdmin: !hasMainAdmin,
        isVerified: !hasMainAdmin,
        createdAt: new Date().toISOString(),
    };
    admins.push(newAdmin);
    await adminStore.write(admins);
    return newAdmin;
}
