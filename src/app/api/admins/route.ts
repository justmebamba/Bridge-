
'use server';

import { NextResponse } from 'next/server';
import type { AdminUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { JsonStore } from '@/lib/json-store';

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

    const userRecord = await store.update(async (admins) => {
        if (admins.some(admin => admin.email === email)) {
            // Throw a custom error to be caught outside
            const err = new Error('Email already in use.');
            (err as any).statusCode = 409;
            throw err;
        }

        // Create user in Firebase Auth
        const createdUser = await getAuth().createUser({ email, password });

        const isMainAdmin = admins.length === 0;
        const newAdmin: AdminUser = {
          id: createdUser.uid, // Use Firebase UID as the ID
          email: email,
          isVerified: isMainAdmin, // First admin is auto-verified
          isMainAdmin: isMainAdmin,
          createdAt: new Date().toISOString(),
        };

        admins.push(newAdmin);
        
        // Set custom claim for main admin
        if (isMainAdmin) {
            await getAuth().setCustomUserClaims(createdUser.uid, { isMainAdmin: true, isVerified: true });
        } else {
            await getAuth().setCustomUserClaims(createdUser.uid, { isMainAdmin: false, isVerified: false });
        }
        
        return { updatedData: admins, result: newAdmin };
    });

    return NextResponse.json({
        id: userRecord.id,
        email: userRecord.email,
        isMainAdmin: userRecord.isMainAdmin,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    if (error.statusCode === 409) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'An admin with this email already exists in Firebase.' }, { status: 409 });
    }
    if (error.code === 'auth/invalid-password') {
         return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Error creating admin account.' }, { status: 500 });
  }
}


// PATCH to update an admin (e.g., verification)
export async function PATCH(request: Request) {
  try {
    await initializeFirebaseAdmin();
    const body = await request.json();
    const { id, isVerified } = body; // ID is now Firebase UID

    if (!id || typeof isVerified !== 'boolean') {
        return NextResponse.json({ message: 'Admin ID and verification status are required.' }, { status: 400 });
    }

    const updatedAdmin = await store.update(async (admins) => {
        const adminIndex = admins.findIndex(admin => admin.id === id);

        if (adminIndex === -1) {
            const err = new Error('Admin not found.');
            (err as any).statusCode = 404;
            throw err;
        }

        // Update local JSON file
        admins[adminIndex].isVerified = isVerified;

        // Update Firebase custom claims
        const currentClaims = (await getAuth().getUser(id)).customClaims || {};
        await getAuth().setCustomUserClaims(id, { ...currentClaims, isVerified });
        
        return { updatedData: admins, result: admins[adminIndex] };
    });


    return NextResponse.json(updatedAdmin);

  } catch (error: any) {
    console.error('Error updating admin:', error);
     if (error.statusCode === 404) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}
