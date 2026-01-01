
'use server';

import { NextResponse } from 'next/server';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';
import { getAdminByEmail, getAdmins, addAdmin } from '@/lib/data-access';

const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// GET handler for checking for main admin - used by signup page
export async function GET() {
    try {
        const admins = await getAdmins();
        const hasMainAdmin = admins.some(admin => admin.isMainAdmin);
        return NextResponse.json({ hasMainAdmin });
    } catch (error) {
        console.error('[API/ADMINS/GET] Error:', error);
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
        
        let admins = await store.read();
        const adminIndex = admins.findIndex(a => a.id === adminId);

        if (adminIndex === -1) {
          return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }
        
        admins[adminIndex].isVerified = isVerified;
        await store.write(admins);

        return NextResponse.json(admins[adminIndex], { status: 200 });

    } catch (error: any) {
        console.error("Error updating admin status:", error);
        return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
    }
}
