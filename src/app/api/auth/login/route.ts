import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { createToken } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { identifier, password, loginType } = await req.json();

  if (!identifier || !password || !loginType) {
    return NextResponse.json({ error: 'Identifier, password, and loginType are required' }, { status: 400 });
  }

  try {
    let user;
    if (loginType === 'email') {
        user = await prisma.user.findUnique({
            where: { email: identifier, role: Role.ADMIN },
        });
    } else {
        user = await prisma.user.findUnique({
            where: { username: identifier },
        });
    }


    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
        return NextResponse.json({ error: 'Your account is inactive. Please contact an administrator.' }, { status: 403 });
    }

    const token = await createToken(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
