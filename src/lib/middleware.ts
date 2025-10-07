
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import clientPromise from './db';
import { ObjectId } from 'mongodb';
import { Role } from './auth';

export function withAuth(handler: (req: NextRequest, { params }: { params: any }) => Promise<NextResponse>) {
  return async (req: NextRequest, { params }: { params: any }) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse(JSON.stringify({ message: 'Authorization header is missing' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new NextResponse(JSON.stringify({ message: 'Token is missing' }), { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
    }

    return handler(req, { params });
  };
}

export function withRole(allowedRoles: Role[]) {
  return (handler: (req: NextRequest, { params }: { params: any }) => Promise<NextResponse>) => {
    return async (req: NextRequest, { params }: { params: any }) => {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new NextResponse(JSON.stringify({ message: 'Authorization header is missing' }), { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return new NextResponse(JSON.stringify({ message: 'Token is missing' }), { status: 401 });
      }

      const payload = await verifyToken(token);
      if (!payload || !payload.sub) {
        return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
      }

      if (!allowedRoles.includes(payload.role as Role)) {
        return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
      }

      return handler(req, { params });
    };
  };
}
