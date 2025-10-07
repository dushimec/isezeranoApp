
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
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
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, priority } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        message,
        priority,
        createdById: userId,
      }
    });
    
    // Create notifications for all singers
    const singers = await prisma.user.findMany({ where: { role: 'SINGER' }, select: { id: true } });
    if (singers.length > 0) {
        await prisma.notification.createMany({
            data: singers.map(singer => ({
                userId: singer.id,
                announcementId: newAnnouncement.id,
                title: 'New Announcement',
                message: newAnnouncement.title,
                senderRole: 'ADMIN', // Or dynamically set based on creator's role
            }))
        });
    }

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
