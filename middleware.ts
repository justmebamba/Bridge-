
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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  // --- Start Authentication Logic ---

  // Define public and authentication routes
  const authPaths = ['/login', '/signup'];
  const protectedPath = '/dashboard';

  // Check if the current path is for the dashboard
  if (pathname.startsWith(protectedPath)) {
    const session = await getIronSession<IronSessionData>(request.cookies, sessionOptions);
    const isAdminLoggedIn = !!session.admin?.id;

    // If user is NOT logged in and tries to access a protected page, redirect to login
    if (!isAdminLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle auth pages (login/signup)
  if (authPaths.some(p => pathname.startsWith(p))) {
      const session = await getIronSession<IronSessionData>(request.cookies, sessionOptions);
      const isAdminLoggedIn = !!session.admin?.id;
      // If user is logged in, redirect them away from auth pages to the dashboard
      if (isAdminLoggedIn) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
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
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
