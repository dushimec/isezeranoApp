import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, message, priority, createdById } = await req.json();

    if (!title || !message || !createdById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        priority,
        createdById,
      },
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
