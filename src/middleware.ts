
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, Role } from '@/lib/auth';

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
  
  const applicablePrefix = PROTECTED_API_ROUTES.find(prefix => pathname.startsWith(prefix));

  if (!applicablePrefix) {
    return NextResponse.next();
  }

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

    if (userRole === Role.ADMIN) {
         return NextResponse.next();
    }
    
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
  matcher: ['/api/admin/:path*', '/api/secretary/:path*', '/api/disciplinarian/:path*', '/api/singer/:path*'],
};
