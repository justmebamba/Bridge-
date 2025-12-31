'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/session';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser, Submission } from '@/lib/types';

const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);
const submissionStore = new JsonStore<Submission[]>('src/data/submissions.json', []);


export async function approveAdminAction(adminId: string, isVerified: boolean) {
    const session = await getSession();
    if (!session.user?.isMainAdmin) {
        throw new Error("Unauthorized: Only main admins can perform this action.");
    }
    
    const admins = await adminStore.read();
    const adminIndex = admins.findIndex(admin => admin.id === adminId);
    if (adminIndex === -1) {
        throw new Error("Admin not found");
    }

    admins[adminIndex].isVerified = isVerified;
    await adminStore.write(admins);
    revalidatePath('/admin');
}

export async function updateSubmissionStatusAction(
  id: string,
  step: 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode',
  status: 'approved' | 'rejected'
) {
  const session = await getSession();
  if (!session.user?.isVerified) {
      throw new Error("Unauthorized: Only verified admins can perform this action.");
  }
  
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
