
'use server';

import { NextResponse } from 'next/server';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import type { AdminUser } from '@/lib/types';

const adminsCollection = collection(db, 'admins');

async function readAdmins(): Promise<AdminUser[]> {
  const snapshot = await getDocs(adminsCollection);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(d => d.data() as AdminUser);
}

export async function GET() {
  try {
    const admins = await readAdmins();
    return NextResponse.json(admins);
  } catch (error: any) {
    console.error('Error reading admins data:', error);
    return NextResponse.json({ message: 'Could not read admins data.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Admin ID is required' }, { status: 400 });
    }

    const adminDocRef = doc(db, 'admins', id);
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
      // Update existing admin (e.g., verification status)
      const { isVerified } = body;
      if (typeof isVerified === 'boolean') {
        await updateDoc(adminDocRef, { isVerified });
      }
    } else {
      // Create new admin
      if (!body.email) {
          return NextResponse.json({ message: 'Email is required for new admin' }, { status: 400 });
      }

      const admins = await readAdmins();
      // The first user to register is the main admin
      const isMainAdmin = admins.length === 0;

      const newAdmin: AdminUser = {
        id: id,
        email: body.email,
        isVerified: isMainAdmin, // Main admin is auto-verified
        isMainAdmin: isMainAdmin,
        createdAt: new Date().toISOString(),
      };
      await setDoc(adminDocRef, newAdmin);
    }

    const updatedDoc = await getDoc(adminDocRef);
    const responseData = updatedDoc.data();

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error('Error processing admin request:', error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
