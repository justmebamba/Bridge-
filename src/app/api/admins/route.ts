
'use server';

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';
import { getSession } from '@/lib/session';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET handler for fetching admins or checking for main admin
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const checkMain = searchParams.get('checkMain');

    try {
        const admins = await store.read();

        if (checkMain) {
            const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
            return NextResponse.json({ hasMainAdmin });
        }

        const session = await getSession();
        if (!session.isLoggedIn || !session.user?.isVerified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
        const currentUser = session.user;
        const isMainAdmin = !!currentUser?.isMainAdmin;

        return NextResponse.json({ admins: safeAdmins, currentUser, isMainAdmin });

    } catch (error) {
        console.error('[API/ADMINS/GET] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// POST handler for creating new admins
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ message: 'Valid email and a password of at least 8 characters are required.' }, { status: 400 });
        }
        
        const admins = await store.read();
        const hasMainAdmin = admins.some(admin => admin.isMainAdmin);

        const existingAdmin = admins.find(admin => admin.email === email);
        if (existingAdmin) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await hash(password, 10);

        const newAdmin: AdminUser = {
            id: new Date().getTime().toString(),
            email,
            passwordHash,
            isMainAdmin: !hasMainAdmin,
            isVerified: !hasMainAdmin, // First admin is auto-verified
            createdAt: new Date().toISOString(),
        };

        admins.push(newAdmin);
        await store.write(admins);
        
        return NextResponse.json({ message: 'Admin account created successfully.' }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
