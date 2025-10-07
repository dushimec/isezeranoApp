
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      const { pathname } = request.nextUrl;

      // If user must change password and is not on the change-password page
      if (user.forcePasswordChange && pathname !== '/dashboard/change-password') {
        return NextResponse.redirect(new URL('/dashboard/change-password', request.url));
      }

      // If user has changed password but tries to access the change-password page again
      if (!user.forcePasswordChange && pathname === '/dashboard/change-password') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      // If cookie is malformed, just continue, let the auth context handle it
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all routes within the dashboard except for static files, etc.
  matcher: '/dashboard/:path*',
};
