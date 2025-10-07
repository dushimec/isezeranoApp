
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { Role } from '@/lib/auth';
import { adminAuth } from '@/lib/middleware';

// Create a new user (Admin only)
export async function POST(req: NextRequest) {
  const adminResponse = await adminAuth(req);
  if (adminResponse) return adminResponse;

  try {
    const { firstName, lastName, email, password, role, username } = await req.json();

    if (!firstName || !lastName || !email || !password || !role || !username) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        isActive: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Get all users (Admin only)
export async function GET(req: NextRequest) {
    const adminResponse = await adminAuth(req);
    if (adminResponse) return adminResponse;

    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                isActive: true,
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
