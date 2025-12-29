
'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { JsonStore } from '@/lib/json-store';
import type { AuthError } from 'firebase-admin/auth';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET all admins or a single admin by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const admins = await store.read();

    if (email) {
        const admin = admins.find(a => a.email === email);
        if (admin) {
            return NextResponse.json(admin);
        }
        return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admins);
  } catch (error: any) {
    console.error('Error reading admins data:', error);
    // Specifically check for ENOENT (file not found) which is a recoverable state
    if (error.code === 'ENOENT') {
        return NextResponse.json([]);
    }
    return NextResponse.json({ message: 'Could not read admins data.' }, { status: 500 });
  }
}

// POST to create a new admin
export async function POST(request: Request) {
    let firebaseUser;
    try {
        await initializeFirebaseAdmin();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        const admins = await store.read().catch(err => {
            // If the file doesn't exist, start with an empty array.
             if (err.code === 'ENOENT') {
                return [];
            }
            throw err;
        });
        
        if (admins.some(admin => admin.email === email)) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        try {
            firebaseUser = await getAuth().createUser({ email, password });
        } catch (error) {
            const authError = error as AuthError;
            if (authError.code === 'auth/email-already-exists') {
                // This is a recoverable state. The user might exist in Firebase Auth but not in our admins.json
                // We can fetch the user and proceed with adding them to our JSON store.
                firebaseUser = await getAuth().getUserByEmail(email);
            } else {
                // Re-throw other auth errors to be caught by the outer catch block
                throw error;
            }
        }
        
        // Final check to ensure we have a user one way or another
        if (!firebaseUser) {
             throw new Error('Could not create or retrieve Firebase user.');
        }

        const isMainAdmin = admins.length === 0;
        const newAdmin: AdminUser = {
            id: firebaseUser.uid,
            email: email,
            isVerified: isMainAdmin,
            isMainAdmin: isMainAdmin,
            createdAt: new Date().toISOString(),
        };

        admins.push(newAdmin);

        if (isMainAdmin) {
            await getAuth().setCustomUserClaims(firebaseUser.uid, { isMainAdmin: true, isVerified: true });
        } else {
            await getAuth().setCustomUserClaims(firebaseUser.uid, { isMainAdmin: false, isVerified: false });
        }
        
        await store.write(admins);

        return NextResponse.json({ id: newAdmin.id, email: newAdmin.email, isMainAdmin: newAdmin.isMainAdmin }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating admin:', error);
        let message = 'An unexpected error occurred.';
        let status = 500;

        if (error.code) { // Firebase Auth errors
            switch (error.code) {
                case 'auth/email-already-exists':
                    // This case should now be handled, but as a fallback:
                    message = 'An admin with this email already exists.';
                    status = 409;
                    break;
                case 'auth/invalid-password':
                    message = 'Password must be at least 6 characters long.';
                    status = 400;
                    break;
                case 'auth/invalid-email':
                    message = 'The email address is not valid.';
                    status = 400;
                    break;
                default:
                    message = `Firebase Auth error: ${error.message}`;
                    break;
            }
        } else if (error.message) {
            message = error.message;
        }
        
        return NextResponse.json({ message }, { status });
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
