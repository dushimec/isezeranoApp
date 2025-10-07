import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        profileImage: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { firstName, lastName, username, email, role, isActive } = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
        email,
        role: role as Role,
        isActive,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error(error);
     if (error.code === 'P2002') {
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
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
