
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, Role } from './auth';

export async function adminAuth(req: NextRequest): Promise<NextResponse | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse(JSON.stringify({ message: 'Authorization header is missing' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new NextResponse(JSON.stringify({ message: 'Token is missing' }), { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.sub || payload.role !== 'ADMIN') {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    
    return null; // a null response means the request is authorized
}
