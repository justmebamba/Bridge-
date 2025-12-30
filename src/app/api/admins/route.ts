

'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { JsonStore } from '@/lib/json-store';
import { login } from '@/lib/session';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET all admins
export async function GET() {
  try {
    const admins = await store.read();
    return NextResponse.json(admins);
  } catch (error: any) {
    console.error('Error reading admins data:', error);
    return NextResponse.json({ message: 'Could not read admins data.' }, { status: 500 });
  }
}

// POST to create a new admin
export async function POST(request: Request) {
    try {
        await initializeFirebaseAdmin();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }
        
        // Use a more specific check for password length for clearer error messages
        if (password.length < 8) {
             return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
        }

        const admins = await store.read();
        
        if (admins.some(admin => admin.email === email)) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        let firebaseUser;
        try {
            firebaseUser = await getAuth().createUser({ email, password });
        } catch (error: any) {
             if (error.code === 'auth/email-already-exists') {
                 // This can happen if a user was created in Firebase but not in our JSON store.
                 // We can try to recover from this. Let's try to find the user.
                firebaseUser = await getAuth().getUserByEmail(email);
             } else if (error.code === 'auth/invalid-password') {
                return NextResponse.json({ message: error.message || 'Password must be at least 6 characters long.'}, { status: 400 });
             } else {
                console.error('[API/ADMINS/POST] Firebase Create Error:', error);
                return NextResponse.json({ message: error.message || 'Failed to create user in Firebase.' }, { status: 500 });
             }
        }

        const isMainAdmin = admins.length === 0;
        const newAdmin: AdminUser = {
            id: firebaseUser.uid,
            email: email,
            isVerified: isMainAdmin,
            isMainAdmin: isMainAdmin,
            createdAt: new Date().toISOString(),
        };
        
        const claims = { isMainAdmin, isVerified: isMainAdmin };
        await getAuth().setCustomUserClaims(firebaseUser.uid, claims);

        admins.push(newAdmin);
        await store.write(admins);
        
        return NextResponse.json({ id: newAdmin.id, email: newAdmin.email, isMainAdmin: newAdmin.isMainAdmin }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Unhandled Error:', error);
        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// PATCH to update an admin (e.g., verification)
export async function PATCH(request: Request) {
  try {
    await initializeFirebaseAdmin();
    const body = await request.json();
    const { id, isVerified } = body;

    if (!id || typeof isVerified !== 'boolean') {
        return NextResponse.json({ message: 'Admin ID and verification status are required.' }, { status: 400 });
    }

    const admins = await store.read();
    const adminIndex = admins.findIndex(admin => admin.id === id);

    if (adminIndex === -1) {
       return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    admins[adminIndex].isVerified = isVerified;

    const currentClaims = (await getAuth().getUser(id)).customClaims || {};
    await getAuth().setCustomUserClaims(id, { ...currentClaims, isVerified });
    
    await store.write(admins);
    
    return NextResponse.json(admins[adminIndex]);

  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ message: error.message || 'Error processing request.' }, { status: 500 });
  }
}
