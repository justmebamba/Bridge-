
'use server';

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { JsonStore } from '@/lib/json-store';
import { login } from '@/lib/session';
import type { AdminUser } from '@/lib/types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';


const store = new JsonStore<AdminUser[]>('src/data/admins.json');

export async function POST(request: Request) {
    try {
        await initializeFirebaseAdmin();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        // We use the client SDK on the backend to verify the password.
        // This is a common pattern to avoid handling passwords directly.
        // The admin SDK's `verifyIdToken` is for tokens, not passwords.
        const clientAuth = getAuth(firebaseApp);
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const firebaseUser = userCredential.user;

        const admins = await store.read();
        const adminUser = admins.find(admin => admin.id === firebaseUser.uid);

        if (!adminUser) {
             return NextResponse.json({ message: 'You are not registered as an admin.' }, { status: 403 });
        }
        
        if (!adminUser.isVerified) {
            return NextResponse.json({ message: 'Your admin account is pending approval.' }, { status: 403 });
        }

        // Password is valid and user is a verified admin. Create the session.
        await login(adminUser);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });

    } catch (error: any) {
        console.error('[API/AUTH/LOGIN] Error:', error);

        if (error.code?.startsWith('auth/')) {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}
