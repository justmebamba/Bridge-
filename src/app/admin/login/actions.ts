'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { compare } from 'bcryptjs';

import { login } from '@/lib/session';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';

const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export async function loginAction(prevState: any, formData: FormData) {
    const validatedFields = loginSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: "Invalid form data."
        }
    }

    const { email, password } = validatedFields.data;
    
    try {
        const admins = await adminStore.read();
        const admin = admins.find(a => a.email === email);

        if (!admin) {
             return { type: 'error', message: 'Invalid email or password.' };
        }

        const isPasswordValid = await compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            return { type: 'error', message: 'Invalid email or password.' };
        }
        
        if (!admin.isVerified) {
            return { type: 'error', message: 'Your admin account is pending approval.' };
        }
        
        const { passwordHash, ...sessionUser } = admin;
        await login(sessionUser);

    } catch (error) {
        console.error('[loginAction Error]', error);
        return { type: 'error', message: 'An unexpected server error occurred.' };
    }
    
    redirect('/admin');
}