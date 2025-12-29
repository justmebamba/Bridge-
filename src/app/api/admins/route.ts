
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { AdminUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

const dataFilePath = path.join(process.cwd(), 'src/data/admins.json');

async function readAdmins(): Promise<AdminUser[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    if (!fileContents) return [];
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

async function writeAdmins(data: AdminUser[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET all admins or a single admin by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const admins = await readAdmins();

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

    let admins = await readAdmins();
    if (admins.some(admin => admin.email === email)) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
    }

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({ email, password });

    const isMainAdmin = admins.length === 0;
    const newAdmin: AdminUser = {
      id: userRecord.uid, // Use Firebase UID as the ID
      email: email,
      isVerified: isMainAdmin, // First admin is auto-verified
      isMainAdmin: isMainAdmin,
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    await writeAdmins(admins);

    // Set custom claim for main admin
    if (isMainAdmin) {
        await getAuth().setCustomUserClaims(userRecord.uid, { isMainAdmin: true, isVerified: true });
    } else {
        await getAuth().setCustomUserClaims(userRecord.uid, { isMainAdmin: false, isVerified: false });
    }

    return NextResponse.json({
        id: newAdmin.id,
        email: newAdmin.email,
        isMainAdmin: newAdmin.isMainAdmin,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    // Handle Firebase-specific errors
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
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

    let admins = await readAdmins();
    const adminIndex = admins.findIndex(admin => admin.id === id);

    if (adminIndex === -1) {
        return NextResponse.json({ message: 'Admin not found.' }, { status: 404 });
    }
    
    // Update local JSON file
    admins[adminIndex].isVerified = isVerified;
    await writeAdmins(admins);

    // Update Firebase custom claims
    const currentClaims = (await getAuth().getUser(id)).customClaims || {};
    await getAuth().setCustomUserClaims(id, { ...currentClaims, isVerified });

    return NextResponse.json(admins[adminIndex]);

  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}
