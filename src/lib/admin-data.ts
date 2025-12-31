
import type { AdminUser } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';

export async function getAdmins() {
  const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);
  const admins = await store.read();
  // Ensure password hashes are not returned
  const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
  return safeAdmins;
}

export async function hasMainAdminCheck() {
    const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);
    const admins = await store.read();
    return admins.some(admin => admin.isMainAdmin);
}
