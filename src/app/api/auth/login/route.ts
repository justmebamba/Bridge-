
'use server';

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { login } from '@/lib/session';
import type { AdminUser } from '@/lib/types';

export async function POST(request: Request) {
    try {
        await initializeFirebaseAdmin();
        const body = await request.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ message: 'ID token is required.' }, { status: 400 });
        }
        
        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        
        const firebaseUser = await adminAuth.getUser(decodedToken.uid);

        const claims = firebaseUser.customClaims || {};

        if (claims.isMainAdmin === undefined) {
             return NextResponse.json({ message: 'You are not registered as an admin.' }, { status: 403 });
        }
        
        if (!claims.isVerified) {
            return NextResponse.json({ message: 'Your admin account is pending approval.' }, { status: 403 });
        }
        
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
        console.error('[API/AUTH/LOGIN] Error:', error);
        
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ message: 'Invalid or expired session token. Please log in again.' }, { status: 401 });
        }
        
        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}
