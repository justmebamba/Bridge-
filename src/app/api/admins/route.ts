
'use server';

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { AdminUser } from '@/lib/types';
import { getSession } from '@/lib/session';

// GET handler for fetching admins or checking for main admin
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const checkMain = searchParams.get('checkMain');

    try {
        if (checkMain) {
            const mainAdminCount = await prisma.admin.count({ where: { isMainAdmin: true } });
            return NextResponse.json({ hasMainAdmin: mainAdminCount > 0 });
        }

        const session = await getSession();
        if (!session.isLoggedIn || !session.user?.isVerified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                email: true,
                isMainAdmin: true,
                isVerified: true,
                createdAt: true,
            }
        });

        const currentUser = session.user;
        const isMainAdmin = !!currentUser?.isMainAdmin;

        return NextResponse.json({ admins, currentUser, isMainAdmin });

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
        
        const mainAdminCount = await prisma.admin.count({ where: { isMainAdmin: true } });
        const hasMainAdmin = mainAdminCount > 0;

        const existingAdmin = await prisma.admin.findUnique({ where: { email } });
        if (existingAdmin) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await hash(password, 10);

        await prisma.admin.create({
            data: {
                email,
                passwordHash,
                isMainAdmin: !hasMainAdmin,
                isVerified: !hasMainAdmin, // First admin is auto-verified
            }
        });
        
        return NextResponse.json({ message: 'Admin account created successfully.' }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
