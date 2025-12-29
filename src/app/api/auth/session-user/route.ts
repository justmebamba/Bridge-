
'use server';

import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getSession();
        if (session.isLoggedIn && session.user) {
            return NextResponse.json({ user: session.user }, { status: 200 });
        }
        return NextResponse.json({ user: null }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to get session user.' }, { status: 500 });
    }
}
