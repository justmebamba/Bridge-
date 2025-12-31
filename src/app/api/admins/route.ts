
'use server';

import { NextResponse } from 'next/server';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET handler for checking for main admin
export async function GET() {
    try {
        const admins = await adminStore.read();
        const mainAdminCount = admins.filter(a => a.isMainAdmin).length;
        return NextResponse.json({ hasMainAdmin: mainAdminCount > 0 });
    } catch (error) {
        console.error('[API/ADMINS/GET] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}

// POST handler for creating new admins
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
        }
        
        const admins = await adminStore.read();
        const hasMainAdmin = admins.some(a => a.isMainAdmin);

        const existingAdmin = admins.find(a => a.email === email);
        if (existingAdmin) {
            return NextResponse.json({ message: 'An admin with this email already exists.' }, { status: 409 });
        }
        
        const newAdmin: AdminUser = {
            id: uuidv4(),
            email,
            isMainAdmin: !hasMainAdmin,
            isVerified: !hasMainAdmin, // First admin is auto-verified
            createdAt: new Date().toISOString(),
        };

        admins.push(newAdmin);
        await adminStore.write(admins);
        
        return NextResponse.json({ message: 'Admin account created successfully.' }, { status: 201 });

    } catch (error: any) {
        console.error('[API/ADMINS/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}

// PATCH handler for updating admin verification
export async function PATCH(request: Request) {
     try {
        const body = await request.json();
        const { adminId, isVerified } = body;

        if (!adminId || typeof isVerified !== 'boolean') {
            return NextResponse.json({ message: 'adminId and isVerified status are required' }, { status: 400 });
        }
        
        const admins = await adminStore.read();
        const adminIndex = admins.findIndex(a => a.id === adminId);

        if (adminIndex === -1) {
          return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }
        
        admins[adminIndex].isVerified = isVerified;

        await adminStore.write(admins);

        return NextResponse.json(admins[adminIndex], { status: 200 });

    } catch (error: any) {
        console.error("Error updating admin status:", error);
        return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
    }
}
