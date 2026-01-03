import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import type { IronSessionData } from 'iron-session';

const sessionOptions = {
  cookieName: 'tiktok_bridge_session',
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through x-next-pathname for other components that might need it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  // --- Start Authentication Logic ---

  // Define public and authentication routes
  const publicPaths = ['/start', '/success', '/api', '/'];
  const authPaths = ['/admin/login', '/admin/signup'];
  const adminBase = '/admin';

  // Check if the current path is for the admin area
  if (pathname.startsWith(adminBase)) {
    const session = await getIronSession<IronSessionData>(request.cookies, sessionOptions);
    const isAdminLoggedIn = session.admin && session.admin.id;
    const isAuthPage = authPaths.some(p => pathname.startsWith(p));

    // 1. If user is logged in...
    if (isAdminLoggedIn) {
      // And they try to access an auth page (login/signup), redirect to dashboard
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } 
    // 2. If user is NOT logged in...
    else {
      // And they try to access a protected admin page, redirect to login
      if (!isAuthPage) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  // --- End Authentication Logic ---

  // Allow the request to continue
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Matcher to specify which routes the middleware should run on.
  // This avoids running it on static files and other internal Next.js paths.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
