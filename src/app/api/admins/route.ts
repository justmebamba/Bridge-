
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import type { AdminUser } from '@/lib/types';

// GET handler for checking for main admin - used by signup page
export async function GET() {
    try {
        const adminsSnapshot = await db.collection('admins').where('isMainAdmin', '==', true).limit(1).get();
        return NextResponse.json({ hasMainAdmin: !adminsSnapshot.empty });
    } catch (error) {
        console.error('[API/ADMINS/GET] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// PATCH handler for updating admin verification
export async function PATCH(request: Request) {
     try {
        const body = await request.json();
        const { adminId, isVerified } = body;

        if (!adminId || typeof isVerified !== 'boolean') {
            return NextResponse.json({ message: 'adminId and isVerified status are required' }, { status: 400 });
        }
        
        const adminRef = db.collection('admins').doc(adminId);
        const adminDoc = await adminRef.get();

        if (!adminDoc.exists) {
          return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }
        
        await adminRef.update({ isVerified });

        const updatedAdmin = { ...adminDoc.data(), isVerified } as AdminUser;

        return NextResponse.json(updatedAdmin, { status: 200 });

    } catch (error: any) {
        console.error("Error updating admin status:", error);
        return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
    }
}
