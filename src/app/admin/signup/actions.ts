
'use server';

import { z } from 'zod';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';

import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';

const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function signupAction(hasMainAdmin: boolean, prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const admins = await adminStore.read();
    const existingAdmin = admins.find((admin) => admin.email === email);
    if (existingAdmin) {
      return { type: 'error', message: 'An admin with this email already exists.' };
    }

    const passwordHash = await hash(password, 10);

    const newAdmin: AdminUser = {
      id: new Date().getTime().toString(),
      email,
      passwordHash,
      isMainAdmin: !hasMainAdmin,
      isVerified: !hasMainAdmin, // Main admin is auto-verified
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    await adminStore.write(admins);

  } catch (error) {
    console.error('[signupAction Error]', error);
    return { type: 'error', message: 'An unexpected server error occurred.' };
  }
  
  // A successful signup always redirects to the login page with a success message
  // We won't return a success message here, but instead let the useEffect on the form handle it.
  // This is a more robust pattern for server actions.
  return { type: 'success', message: 'Registration successful!' };
}
