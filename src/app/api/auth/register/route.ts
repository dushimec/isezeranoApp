import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { firstName, lastName, username, email, password } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields for admin registration' }, { status: 400 });
  }

  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    if (adminCount > 0) {
      return NextResponse.json({ error: 'An admin account already exists. Please log in.' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username: username || email, // Admin can use email as username if not provided
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Omit password from the returned user object
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ message: "Admin user created successfully", user: userWithoutPassword }, { status: 201 });

  } catch (error: any) {
    console.error('Error during admin registration:', error);
    if (error.code === 'P2002') { // Prisma unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      if(target?.includes('email')){
          return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }
      if(target?.includes('username')){
          return NextResponse.json({ error: 'A user with this username already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'A user with these details already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An internal error occurred.', details: error.message }, { status: 500 });
  }
}
