import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';
import { Role } from '@prisma/client';

const API_PREFIXES = {
    ADMIN: '/api/admin',
    SECRETARY: '/api/secretary',
    DISCIPLINARIAN: '/api/disciplinarian',
    SINGER: '/api/singer'
};

const ROLE_ACCESS: { [key in Role]: string[] } = {
    ADMIN: [API_PREFIXES.ADMIN, API_PREFIXES.SECRETARY, API_PREFIXES.DISCIPLINARIAN, API_PREFIXES.SINGER],
    SECRETARY: [API_PREFIXES.SECRETARY],
    DISCIPLINARIAN: [API_PREFIXES.DISCIPLINARIAN],
    SINGER: [API_PREFIXES.SINGER]
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const applicablePrefix = Object.values(API_PREFIXES).find(prefix => pathname.startsWith(prefix));

  if (!applicablePrefix) {
    return NextResponse.next();
  }

  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token payload' }, { status: 401 });
    }

    const role = payload.role as Role;
    
    const allowedPrefixes = ROLE_ACCESS[role] || [];

    if (!allowedPrefixes.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.next();

  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
