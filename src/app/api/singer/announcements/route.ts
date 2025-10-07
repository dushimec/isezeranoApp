import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
        orderBy: { 
            createdAt: 'desc' 
        },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
