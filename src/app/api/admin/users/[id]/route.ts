
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@/lib/auth';
import { adminAuth } from '@/lib/middleware';
import bcrypt from 'bcrypt';

interface UserIdParams {
  params: { id: string };
}

// Get a single user by ID (Admin only)
export async function GET(req: NextRequest, { params }: UserIdParams) {
  const adminResponse = await adminAuth(req);
  if (adminResponse) return adminResponse;

  const { id } = params;

  try {
    const user = await db.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update a user (Admin only)
export async function PUT(req: NextRequest, { params }: UserIdParams) {
  const adminResponse = await adminAuth(req);
  if (adminResponse) return adminResponse;

  const { id } = params;
  try {
    const { firstName, lastName, email, username, password, role, isActive } = await req.json();

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        username,
        ...(password && { password: hashedPassword }),
        ...(role && { role: role as Role }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Delete a user (Admin only)
export async function DELETE(req: NextRequest, { params }: UserIdParams) {
    const adminResponse = await adminAuth(req);
    if (adminResponse) return adminResponse;

    const { id } = params;

    try {
        await db.user.delete({ where: { id } });
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
