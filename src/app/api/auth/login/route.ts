
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
        
        // This is a workaround to verify passwords since the Admin SDK cannot directly do this.
        // We MUST wrap this in a try/catch because it will throw on incorrect passwords.
        try {
            const clientAuth = getAuth(firebaseApp);
            await signInWithEmailAndPassword(clientAuth, email, password);
        } catch (error: any) {
            // These error codes are from the CLIENT SDK
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
            }
            // Catch network or other unexpected client SDK errors
            console.error('[API/AUTH/LOGIN] Client SDK Error:', error);
            return NextResponse.json({ message: 'An unexpected error occurred during authentication.' }, { status: 500 });
        }
        
        // If password is correct, now use the Admin SDK to get the full user record and claims
        const firebaseUser = await getAuth().getUserByEmail(email);

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
        console.error('[API/AUTH/LOGIN] Main Error:', error);
         // These error codes are from the ADMIN SDK
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}
