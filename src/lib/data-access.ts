
import type { Submission, AdminUser } from '@/lib/types';
import { JsonStore } from './json-store';
import { v4 as uuidv4 } from 'uuid';

const submissionStore = new JsonStore<Submission[]>('src/data/submissions.json', []);
const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);

export async function getSubmissions(): Promise<Submission[]> {
  const submissions = await submissionStore.read();
  return submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAdmins(): Promise<Omit<AdminUser, 'passwordHash'>[]> {
    const admins = await adminStore.read();
    return admins.map(({ passwordHash, ...rest }) => rest).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getAdminById(id: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    const admins = await adminStore.read();
    const admin = admins.find(a => a.id === id);
    if (!admin) return null;
    const { passwordHash, ...rest } = admin;
    return rest;
}


export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
    const admins = await adminStore.read();
    return admins.find(a => a.email === email) || null;
}

export async function addAdmin({ email, passwordHash, isMainAdmin }: { email: string; passwordHash: string; isMainAdmin: boolean }): Promise<AdminUser> {
    const admins = await adminStore.read();
    const newAdmin: AdminUser = {
        id: uuidv4(),
        email,
        passwordHash,
        isMainAdmin,
        isVerified: isMainAdmin, // First admin is auto-verified
        createdAt: new Date().toISOString(),
    };
    admins.push(newAdmin);
    await adminStore.write(admins);
    return newAdmin;
}
