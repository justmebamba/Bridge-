
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import type { AdminUser } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
        }
        
        // Check if admin with this email already exists
        const existingAdminSnapshot = await db.collection('admins').where('email', '==', email).limit(1).get();
        if (!existingAdminSnapshot.empty) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        // Check if a main admin already exists
        const mainAdminSnapshot = await db.collection('admins').where('isMainAdmin', '==', true).limit(1).get();
        const hasMainAdmin = !mainAdminSnapshot.empty;
        
        const passwordHash = await bcrypt.hash(password, 10);

        const newAdmin: Omit<AdminUser, 'id'> = {
            email,
            passwordHash,
            isMainAdmin: !hasMainAdmin,
            isVerified: !hasMainAdmin, // First admin is auto-verified
            createdAt: FieldValue.serverTimestamp() as any,
        };

        await db.collection('admins').add(newAdmin);
        
        return NextResponse.json({ message: 'Admin account created successfully. Please log in.' }, { status: 201 });

    } catch (error: any) {
        console.error('[API/SIGNUP/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
