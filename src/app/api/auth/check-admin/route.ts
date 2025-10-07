import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    return NextResponse.json({ exists: adminCount > 0 });
  } catch (error) {
    console.error('Error checking for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
