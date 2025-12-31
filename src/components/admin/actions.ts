
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { hash, compare } from 'bcryptjs';

import { login } from '@/lib/session';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser, Submission } from '@/lib/types';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

const submissionStore = new JsonStore<Submission[]>(
  'src/data/submissions.json',
  []
);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function signupAction(prevState: any, formData: FormData) {
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
    const admins = await store.read();
    const existingAdmin = admins.find((admin) => admin.email === email);
    if (existingAdmin) {
      return { type: 'error', message: 'An admin with this email already exists.' };
    }

    const isFirstAdmin = admins.length === 0;
    const passwordHash = await hash(password, 10);

    const newAdmin: AdminUser = {
      id: new Date().getTime().toString(),
      email,
      passwordHash,
      isMainAdmin: isFirstAdmin,
      isVerified: isFirstAdmin,
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    await store.write(admins);

  } catch (error) {
    return { type: 'error', message: 'An unexpected server error occurred.' };
  }
  
  redirect('/admin/login');
}


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
        const admins = await store.read();
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
        return { type: 'error', message: 'An unexpected server error occurred.' };
    }
    
    redirect('/admin');
}

export async function approveAdminAction(adminId: string, isVerified: boolean) {
    const admins = await store.read();
    const adminIndex = admins.findIndex(admin => admin.id === adminId);
    if (adminIndex === -1) {
        throw new Error("Admin not found");
    }

    admins[adminIndex].isVerified = isVerified;
    await store.write(admins);
    revalidatePath('/admin');
}

export async function updateSubmissionStatusAction(
  id: string,
  step: 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode',
  status: 'approved' | 'rejected'
) {
  const submissions = await submissionStore.read();
  const submissionIndex = submissions.findIndex((s) => s.id === id);

  if (submissionIndex === -1) {
    throw new Error('Submission not found');
  }

  const submission = submissions[submissionIndex];
  const statusKey = `${step}Status` as keyof Submission;

  if (statusKey in submission) {
    (submission as any)[statusKey] = status;
  } else {
    throw new Error(`Invalid step: ${step}`);
  }

  submissions[submissionIndex] = submission;
  await submissionStore.write(submissions);

  revalidatePath('/admin');
}
