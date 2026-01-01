
'use server';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
    try {
        const session = await getSession();
        session.destroy();
        return NextResponse.json({ message: 'Logout successful.' }, { status: 200 });
    } catch (error: any) {
        console.error('[API/LOGOUT/POST] Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
