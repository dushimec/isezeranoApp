
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = await verifyToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection<UserDocument>('users').findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.isActive) {
      return NextResponse.json({ error: 'User account is inactive' }, { status: 403 });
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: { ...userWithoutPassword, id: user._id.toHexString() } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
