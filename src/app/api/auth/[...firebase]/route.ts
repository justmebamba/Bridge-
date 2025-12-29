
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';


const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);

// This route is responsible for two things:
// 1. Handling session login: Taking a Firebase Auth ID token, verifying it, and creating a session cookie.
// 2. Handling session logout: Clearing the session cookie.
// It also enriches the session data with user details from the admins.json file.

export async function GET(request: NextRequest) {
  try {
    await initializeFirebaseAdmin();
    const session = cookies().get('session')?.value || '';
    
    // Validate session cookie
    if (!session) {
      return NextResponse.json({ isLogged: false }, { status: 200 });
    }
    
    const decodedClaims = await auth().verifySessionCookie(session, true);
    
    if (!decodedClaims) {
      return NextResponse.json({ isLogged: false, message: 'Invalid session cookie.' }, { status: 401 });
    }

    // Enrich with local admin data
    const admins = await store.read();
    const adminDetails = admins.find(a => a.id === decodedClaims.uid);

    if (!adminDetails) {
       // This can happen if an admin was deleted from the JSON but still has a valid session.
       // We should invalidate their session.
       cookies().delete('session');
       return NextResponse.json({ isLogged: false, message: 'Admin details not found in store.' }, { status: 404 });
    }

    // Crucially, check if the details in the store match the session claims.
    // If a main admin revokes verification, the session should become invalid.
    if (adminDetails.isVerified !== decodedClaims.isVerified) {
       cookies().delete('session');
       return NextResponse.json({ isLogged: false, message: 'Session claims do not match stored permissions.'}, { status: 403 });
    }

    return NextResponse.json({ isLogged: true, user: adminDetails }, { status: 200 });

  } catch(error) {
     console.error("GET /api/auth/session error:", error);
     // Clear cookie on any error during verification
     cookies().delete('session');
     return NextResponse.json({ isLogged: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = headers().get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
        await initializeFirebaseAdmin();
        const decodedToken = await auth().verifyIdToken(idToken);

        if (decodedToken) {
          //Generate session cookie
          const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
          const sessionCookie = await auth().createSessionCookie(idToken, {
            expiresIn,
          });
          const options = {
            name: 'session',
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          };

          //Add the cookie to the browser
          cookies().set(options);
          return NextResponse.json({ status: 'success' }, { status: 200 });
        }
    } catch (error) {
        console.error("POST /api/auth/session error:", error);
        return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 401 });
    }
  }

  return NextResponse.json({ status: 'error', message: 'No token provided' }, { status: 400 });
}


export async function DELETE(request: NextRequest) {
    try {
        cookies().delete('session');
        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/auth/session error:", error);
        return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
    }
}
