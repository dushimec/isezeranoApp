
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    const sectionLeaderId = decoded.sub;

    if (!sectionLeaderId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sectionLeaderId },
      select: { section: true },
    });

    if (!user || !user.section) {
        return NextResponse.json({ error: 'Section not found for this leader' }, { status: 404 });
    }

    const members = await prisma.user.findMany({
        where: { section: user.section },
        select: { id: true, fullName: true },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
