
import { NextResponse } from 'next/server';
import { getAdmins, addAdmin, getAdminByEmail } from '@/lib/data-access';
import bcrypt from 'bcryptjs';

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
        
        const existingAdmin = await getAdminByEmail(email);
        if (existingAdmin) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        const admins = await getAdmins();
        const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
        
        const passwordHash = await bcrypt.hash(password, 10);

        await addAdmin({
            email,
            passwordHash,
            isMainAdmin: !hasMainAdmin,
        });
        
        return NextResponse.json({ message: 'Admin account created successfully. Please log in.' }, { status: 201 });

    } catch (error: any) {
        console.error('[API/SIGNUP/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
