
'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getSession } from '@/lib/session';

// Helper function to convert Firebase UserRecord to our AdminUser type
const toAdminUser = (user: import('firebase-admin/auth').UserRecord): AdminUser => ({
    id: user.uid,
    email: user.email!,
    isVerified: user.customClaims?.isVerified ?? false,
    isMainAdmin: user.customClaims?.isMainAdmin ?? false,
    createdAt: user.metadata.creationTime,
});

async function listAllAdmins() {
    await initializeFirebaseAdmin();
    const auth = getAuth();
    const allUsers: AdminUser[] = [];
    let pageToken;

    do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        listUsersResult.users.forEach(user => {
            // We identify admins by checking for the presence of our custom claims
            if (user.customClaims?.isMainAdmin !== undefined || user.customClaims?.isVerified !== undefined) {
                 allUsers.push(toAdminUser(user));
            }
        });
        pageToken = listUsersResult.pageToken;
    } while (pageToken);

    return allUsers;
}


// GET all admins OR check if a main admin exists
export async function GET(request: Request) {
  try {
    await initializeFirebaseAdmin();
    const { searchParams } = new URL(request.url);

    if (searchParams.get('checkMain')) {
      const admins = await listAllAdmins();
      const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
      return NextResponse.json({ hasMainAdmin });
    }
    
    // For the admin dashboard, we need to return all admins and the current user
    const session = await getSession();
    const admins = await listAllAdmins();

    return NextResponse.json({ admins, currentUser: session.user });

  } catch (error: any) {
    console.error('[API/ADMINS/GET] Unhandled Error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}

// POST to create a new admin
export async function POST(request: Request) {
    try {
        await initializeFirebaseAdmin();
        const auth = getAuth();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ message: 'Email and a password of at least 8 characters are required.' }, { status: 400 });
        }
        
        const admins = await listAllAdmins();
        const isFirstAdmin = admins.length === 0;
        
        let firebaseUser;
        try {
            firebaseUser = await auth.createUser({ email, password });
        } catch (error: any) {
             if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
             } else if (error.code === 'auth/invalid-password') {
                return NextResponse.json({ message: 'Password must be at least 8 characters long.'}, { status: 400 });
             }
             // Re-throw other errors to be caught by the outer catch block
             throw error;
        }
        
        // The first user to register becomes the main admin and is automatically verified.
        // Subsequent users are not main admins and are not verified by default.
        const claims = { 
            isMainAdmin: isFirstAdmin, 
            isVerified: isFirstAdmin,
        };
        await auth.setCustomUserClaims(firebaseUser.uid, claims);
        
        return NextResponse.json({ id: firebaseUser.uid, email, isMainAdmin: isFirstAdmin }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Unhandled Error:', error);
        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// PATCH to update an admin (e.g., verification)
export async function PATCH(request: Request) {
  try {
    await initializeFirebaseAdmin();
    const auth = getAuth();
    const body = await request.json();
    const { id, isVerified } = body;

    if (!id || typeof isVerified !== 'boolean') {
        return NextResponse.json({ message: 'Admin ID and verification status are required.' }, { status: 400 });
    }
    
    const userToUpdate = await auth.getUser(id);
    if (!userToUpdate) {
         return NextResponse.json({ message: 'Admin not found.' }, { status: 404 });
    }
    
    const currentClaims = userToUpdate.customClaims || {};
    await auth.setCustomUserClaims(id, { ...currentClaims, isVerified });
    
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
