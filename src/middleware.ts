
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/user-roles';

const PROTECTED_ROUTES = {
  [USER_ROLES.ADMIN]: ['/admin'],
  [USER_ROLES.SECRETARY]: ['/secretary'],
  [USER_ROLES.DISCIPLINARIAN]: ['/disciplinarian'],
  [USER_ROLES.SECTION_LEADER]: ['/section-leader'],
  [USER_ROLES.SINGER]: ['/singer'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get('user');
  let user = null;
  if(userCookie){
    try {
      user = JSON.parse(userCookie.value);
    } catch (error) {
      console.error("Failed to parse user cookie:", error);
    }
  }


  // If the user is not logged in and is trying to access a protected route
  if (!user && Object.values(PROTECTED_ROUTES).flat().some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in
  if (user) {
    const userRole = user.role.toUpperCase();
    const allowedRoutes = PROTECTED_ROUTES[userRole] || [];

    const isAuthorized = allowedRoutes.some(route => pathname.startsWith(route));

    if (!isAuthorized) {
      // Check if the user is trying to access a route for another role
      const isAccessingOtherRoleRoute = Object.entries(PROTECTED_ROUTES)
        .filter(([role]) => role !== userRole)
        .some(([, routes]) => routes.some(route => pathname.startsWith(route)));

      if (isAccessingOtherRoleRoute) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/secretary/:path*',
    '/disciplinarian/:path*',
    '/section-leader/:path*',
    '/singer/:path*',
    '/dashboard/:path*',
  ],
};

