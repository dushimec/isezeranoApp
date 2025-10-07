import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { firstName, lastName, username, email, password, role } = await req.json();

  if (!firstName || !lastName || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  if (!username && !email) {
    return NextResponse.json({ error: 'Either username or email is required' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        role: role as Role,
        profileImage: `https://picsum.photos/seed/${username || email}/400/400`,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') { // Prisma unique constraint violation
      const target = error.meta?.target as string[];
      let message = 'A user with this ';
      if (target.includes('username')) {
        message += 'username';
      }
      if (target.includes('email')) {
        message += target.includes('username') ? ' or email' : 'email';
      }
      message += ' already exists.';
        return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
