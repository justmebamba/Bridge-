
'use server';

import { revalidatePath } from 'next/cache';
import { updateSubmissionStepStatus as updateStatus, deleteSubmission as deleteData } from '@/lib/data-access';

export async function updateSubmissionStatusAction(
  id: string,
  step: 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode',
  status: 'approved' | 'rejected'
) {
  try {
    await updateStatus(id, step, status);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSubmissionAction(submissionId: string) {
    try {
        await deleteData(submissionId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
