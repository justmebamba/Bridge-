
'use server';

import { NextResponse } from 'next/server';
import { login } from '@/lib/session';
import type { AdminUser } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';
import { compare } from 'bcryptjs';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }
        
        const admins = await store.read();
        const admin = admins.find(a => a.email === email);

        if (!admin) {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        const isPasswordValid = await compare(password, admin.passwordHash);

        if (!isPasswordValid) {
             return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }
        
        if (!admin.isVerified) {
            return NextResponse.json({ message: 'Your admin account is pending approval.' }, { status: 403 });
        }
        
        // Don't include passwordHash in the session
        const { passwordHash, ...sessionUser } = admin;

        await login(sessionUser);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });

    } catch (error: any) {
        console.error('[API/AUTH/LOGIN] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
