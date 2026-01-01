
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is used to pass the pathname to server components.
// It's a workaround for accessing the pathname in server-side layouts.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })
}
