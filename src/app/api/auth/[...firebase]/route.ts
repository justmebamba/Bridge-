
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { AdminUser } from '@/lib/types';


const dataFilePath = path.join(process.cwd(), 'src/data/admins.json');

async function readAdmins(): Promise<AdminUser[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    if (!fileContents) return [];
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}


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
      return NextResponse.json({ isLogged: false }, { status: 401 });
    }

    // Enrich with local admin data
    const admins = await readAdmins();
    const adminDetails = admins.find(a => a.id === decodedClaims.uid);

    if (!adminDetails) {
       return NextResponse.json({ message: 'Admin details not found.' }, { status: 404 });
    }

    return NextResponse.json({ isLogged: true, user: adminDetails }, { status: 200 });

  } catch(error) {
     return NextResponse.json({ isLogged: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = headers().get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(idToken);

    if (decodedToken) {
      //Generate session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await auth().createSessionCookie(idToken, {
        expiresIn,
      });
      const options = {
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      //Add the cookie to the browser
      cookies().set(options);
    }
  }

  return NextResponse.json({}, { status: 200 });
}
