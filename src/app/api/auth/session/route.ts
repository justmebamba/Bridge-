
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAdminById } from '@/lib/data-access';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.admin?.id) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        // Re-validate user from DB to ensure they still exist and are valid.
        const admin = await getAdminById(session.admin.id);
        if (!admin) {
            await session.destroy();
            return NextResponse.json({ message: 'User not found' }, { status: 401 });
        }

        // Return session data without sensitive info like password hash
        return NextResponse.json({ admin: admin }, { status: 200 });

    } catch (error: any) {
        console.error('[API/SESSION/GET] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
