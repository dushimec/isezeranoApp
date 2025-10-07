
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import bcrypt from 'bcrypt';
import { createToken } from '@/lib/auth';
import { UserDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { identifier, password, loginType } = await req.json();

  if (!identifier || !password || !loginType) {
    return NextResponse.json({ error: 'Identifier, password, and loginType are required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    let user: UserDocument | null = null;
    if (loginType === 'email') {
        user = await db.collection<UserDocument>('users').findOne({ email: identifier, role: 'ADMIN' });
    } else {
        user = await db.collection<UserDocument>('users').findOne({ username: identifier });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password as string);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
        return NextResponse.json({ error: 'Your account is inactive. Please contact an administrator.' }, { status: 403 });
    }

    const token = await createToken(user._id.toHexString(), user.role);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
        token, 
        user: {
            ...userWithoutPassword,
            id: user._id.toHexString(),
        } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
