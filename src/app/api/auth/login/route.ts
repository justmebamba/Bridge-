
'use server';

import { NextResponse } from 'next/server';
import { getAdminByEmail } from '@/lib/data-access';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }
        
        const admin = await getAdminByEmail(email);

        if (!admin || !admin.isVerified) {
            return NextResponse.json({ message: 'Invalid credentials or account not verified.' }, { status: 401 });
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials or account not verified.' }, { status: 401 });
        }

        const session = await getSession();
        session.admin = {
            id: admin.id,
            email: admin.email,
            isMainAdmin: admin.isMainAdmin,
        };
        await session.save();
        
        return NextResponse.json({ message: 'Login successful.' }, { status: 200 });

    } catch (error: any) {
        console.error('[API/LOGIN/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
