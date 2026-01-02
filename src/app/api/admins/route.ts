
'use server';

import { NextResponse } from 'next/server';
import { getAdmins, updateAdminVerification } from '@/lib/data-access';

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
        
        const updatedAdmin = await updateAdminVerification(adminId, isVerified);

        return NextResponse.json(updatedAdmin, { status: 200 });

    } catch (error: any) {
        console.error("Error updating admin status:", error);
         if (error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
    }
}
