
'use server';

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { login } from '@/lib/session';
import type { AdminUser } from '@/lib/types';
import { getApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithEmailAndPassword } from "firebase/auth";

// This is a delicate workaround. Because the Admin SDK cannot verify passwords,
// we need a client instance to do so. But we need to initialize it with a bogus config
// because we don't want it to actually connect to Firebase. We just need the SDK logic.
const clientApp = getApp(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "[DEFAULT]");

async function verifyPassword(email: string, password: string):Promise<boolean> {
    try {
        const clientAuth = getClientAuth(clientApp);
        await signInWithEmailAndPassword(clientAuth, email, password);
        return true;
    } catch(error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            return false;
        }
        // Re-throw other errors (like user-not-found, network issues, etc.)
        // to be handled by the main login function.
        throw error;
    }
}


export async function POST(request: Request) {
    try {
        await initializeFirebaseAdmin();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }
        
        const adminAuth = getAuth();
        const firebaseUser = await adminAuth.getUserByEmail(email);

        // This is the user from Firebase Auth, NOT our internal list.
        // We now check their claims.
        const claims = firebaseUser.customClaims || {};

        if (claims.isMainAdmin === undefined) {
             return NextResponse.json({ message: 'You are not registered as an admin.' }, { status: 403 });
        }
        
        if (!claims.isVerified) {
            return NextResponse.json({ message: 'Your admin account is pending approval.' }, { status: 403 });
        }

        // Now that we know the user is a verified admin, we verify their password.
        const isPasswordCorrect = await verifyPassword(email, password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }
        
        // Password is valid and user is a verified admin. Create the session.
        const adminUser: AdminUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            isVerified: claims.isVerified,
            isMainAdmin: claims.isMainAdmin,
            createdAt: firebaseUser.metadata.creationTime,
        };

        await login(adminUser);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });

    } catch (error: any) {
        console.error('[API/AUTH/LOGIN] Main Error:', error);
        
        // These error codes are from the ADMIN SDK `getUserByEmail` call or re-thrown from `verifyPassword`
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}
