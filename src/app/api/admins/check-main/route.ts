
'use server';

import { NextResponse } from 'next/server';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';

const store = new JsonStore<AdminUser[]>('src/data/admins.json');

export async function GET() {
  try {
    const admins = await store.read();
    const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
    return NextResponse.json({ hasMainAdmin });
  } catch (error) {
    // If the file doesn't exist, it means there are no admins yet.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ hasMainAdmin: false });
    }
    console.error('Error checking for main admin:', error);
    return NextResponse.json({ message: 'Could not check for main admin.' }, { status: 500 });
  }
}
