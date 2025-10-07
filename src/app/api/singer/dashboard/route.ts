import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const upcomingRehearsals = await prisma.rehearsal.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5,
      });
      const upcomingServices = await prisma.service.findMany({
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 5
      });
  
      const upcomingEvents = [...upcomingRehearsals.map(r => ({...r, type: 'rehearsal'})), ...upcomingServices.map(s => ({...s, type: 'service'}))]
          .sort((a,b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5);

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const attendanceSummary = await prisma.attendance.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
            status: true
        }
    });

    return NextResponse.json({
      upcomingEvents,
      announcements,
      notifications,
      attendanceSummary: attendanceSummary.map(item => ({ status: item.status, count: item._count.status })),
    });
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
