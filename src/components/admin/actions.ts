
'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function approveAdminAction(adminId: string, isVerified: boolean) {
    const session = await getSession();
    if (!session.user?.isMainAdmin) {
        throw new Error("Unauthorized: Only main admins can perform this action.");
    }
    
    await prisma.admin.update({
        where: { id: adminId },
        data: { isVerified }
    });

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
  
  await prisma.submission.update({
      where: { id },
      data: {
          [`${step}Status`]: status,
      }
  });

  revalidatePath('/admin');
}
