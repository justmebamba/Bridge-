
'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';
import { hash } from 'bcryptjs';
import { getSession } from '@/lib/session';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET all admins OR check if a main admin exists
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admins = await store.read();

    if (searchParams.get('checkMain')) {
      const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
      return NextResponse.json({ hasMainAdmin });
    }
    
    // For the admin dashboard, we need to return all admins and the current user
    const session = await getSession();
    const currentUserFromSession = session.user;
    
    // We don't want to send password hashes to the client
    const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
    const safeCurrentUser = currentUserFromSession 
        ? { ...currentUserFromSession, passwordHash: undefined } 
        : undefined;

    return NextResponse.json({ admins: safeAdmins, currentUser: safeCurrentUser });

  } catch (error: any) {
    console.error('[API/ADMINS/GET] Unhandled Error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}

// POST to create a new admin
export async function POST(request: Request) {
    try {
        const admins = await store.read();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ message: 'Email and a password of at least 8 characters are required.' }, { status: 400 });
        }
        
        const existingAdmin = admins.find(admin => admin.email === email);
        if (existingAdmin) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        const isFirstAdmin = admins.length === 0;
        const passwordHash = await hash(password, 10);
        
        const newAdmin: AdminUser = {
            id: new Date().getTime().toString(), // Simple unique ID
            email,
            passwordHash,
            isMainAdmin: isFirstAdmin,
            isVerified: isFirstAdmin,
            createdAt: new Date().toISOString(),
        };
        
        admins.push(newAdmin);
        await store.write(admins);
        
        // Return a safe version of the user, without the password hash
        return NextResponse.json({ id: newAdmin.id, email, isMainAdmin: isFirstAdmin }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Unhandled Error:', error);
        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// PATCH to update an admin (e.g., verification)
export async function PATCH(request: Request) {
  try {
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
    
    // Invalidate session if an admin revokes their own access
    const session = await getSession();
    if (session.user?.id === id && !isVerified) {
        await session.destroy();
    }
    
    return NextResponse.json({ success: true, id, isVerified });

  } catch (error: any) {
    console.error('[API/ADMINS/PATCH] Unhandled Error:', error);
    return NextResponse.json({ message: error.message || 'Error processing request.' }, { status: 500 });
  }
}
