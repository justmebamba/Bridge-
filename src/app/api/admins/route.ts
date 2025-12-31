
'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// PATCH to update an admin (e.g., verification)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user?.isMainAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, isVerified } = body;
    const admins = await store.read();

    if (!id || typeof isVerified !== 'boolean') {
        return NextResponse.json({ message: 'Admin ID and verification status are required.' }, { status: 400 });
    }
    
    const adminIndex = admins.findIndex(admin => admin.id === id);
    if (adminIndex === -1) {
         return NextResponse.json({ message: 'Admin not found.' }, { status: 404 });
    }
    
    admins[adminIndex].isVerified = isVerified;
    await store.write(admins);
    
    // Invalidate session if an admin revokes their own access (edge case)
    if (session.user?.id === id && !isVerified) {
        await session.destroy();
    }
    
    revalidatePath('/admin');
    return NextResponse.json({ success: true, id, isVerified });

  } catch (error: any) {
    console.error('[API/ADMINS/PATCH] Unhandled Error:', error);
    return NextResponse.json({ message: error.message || 'Error processing request.' }, { status: 500 });
  }
}
