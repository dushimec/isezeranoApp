import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth'; // Assuming verifyToken is in jose-auth.ts
import { Role } from '@prisma/client';

const API_PREFIXES: Record<Role, string> = {
  ADMIN: '/api/admin',
  SECRETARY: '/api/secretary',
  DISCIPLINARIAN: '/api/disciplinarian',
  SINGER: '/api/singer'
};

const ROLE_HIERARCHY: Record<Role, Role[]> = {
    ADMIN: [Role.ADMIN, Role.SECRETARY, Role.DISCIPLINARIAN, Role.SINGER],
    SECRETARY: [Role.SECRETARY],
    DISCIPLINARIAN: [Role.DISCIPLINARIAN],
    SINGER: [Role.SINGER]
};

const PROTECTED_API_ROUTES = Object.values(API_PREFIXES);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Find if the request is for a protected API route
  const applicablePrefix = PROTECTED_API_ROUTES.find(prefix => pathname.startsWith(prefix));

  // If it's not a protected API route, just continue
  if (!applicablePrefix) {
    return NextResponse.next();
  }

  // Check for the token
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload || typeof payload.role !== 'string') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token payload' }, { status: 401 });
    }
    
    const userRole = payload.role as Role;
    const allowedRoles = ROLE_HIERARCHY[userRole];

    const isAuthorized = Object.entries(API_PREFIXES).some(([role, prefix]) => {
        return pathname.startsWith(prefix) && allowedRoles.includes(role as Role);
    });

    // Special case: Admin can access everything
    if (userRole === Role.ADMIN) {
         return NextResponse.next();
    }
    
    // Check if the user's role has permission for the requested API prefix
    if (pathname.startsWith(API_PREFIXES[userRole])) {
      return NextResponse.next();
    }
    
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
