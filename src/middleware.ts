
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Role } from '@/lib/types';

// Defines which roles can access which API prefixes.
// More specific roles are listed first.
const ROLE_ACCESS_HIERARCHY: { role: Role; prefix: string }[] = [
  { role: 'SINGER', prefix: '/api/singer' },
  { role: 'DISCIPLINARIAN', prefix: '/api/disciplinarian' },
  { role: 'SECRETARY', prefix: '/api/secretary' },
  { role: 'ADMIN', prefix: '/api/admin' },
];

const ALL_PROTECTED_PREFIXES = [
    ...new Set(ROLE_ACCESS_HIERARCHY.map(item => item.prefix)),
    '/api/profile',
    '/api/rehearsals',
    '/api/services',
    '/api/announcements',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if the request path matches any of our protected API routes
  const isProtected = ALL_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for authorization token
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

    // Admins can access everything
    if (userRole === 'ADMIN') {
         return NextResponse.next();
    }

    // Any authenticated user can access these common endpoints
    const commonEndpoints = ['/api/profile', '/api/rehearsals', '/api/services', '/api/announcements'];
    if (commonEndpoints.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }
    
    // Check if the user's role has permission for the requested path
    const hasPermission = ROLE_ACCESS_HIERARCHY
        .filter(item => item.role === userRole)
        .some(item => pathname.startsWith(item.prefix));

    if (hasPermission) {
      return NextResponse.next();
    }
    
    // If no permission is found, deny access
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
