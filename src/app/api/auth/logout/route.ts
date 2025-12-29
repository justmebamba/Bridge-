
'use server';

import { logout } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await logout();
        return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to log out.' }, { status: 500 });
    }
}
