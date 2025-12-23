import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Check if the user is trying to access the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    
    // 2. Check for your authentication token (cookie)
    // CHANGE 'session_token' to whatever you named your auth cookie
    const token = request.cookies.get('sb-hzmdvsxeakgcozptbkft-auth-token');

    // 3. If no token exists, redirect to the Access Denied page
    if (!token) {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  // Allow the request to continue if they are logged in or not on a protected route
  return NextResponse.next();
}

// Optimization: Only run this middleware on dashboard routes
export const config = {
  matcher: '/dashboard/:path*',
}