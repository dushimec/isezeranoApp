
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const upcomingRehearsals = await db.rehearsal.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5,
      });
      const upcomingServices = await db.service.findMany({
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 5
      });
  
      const upcomingEvents = [...upcomingRehearsals.map(r => ({...r, type: 'REHEARSAL', location: r.location})), ...upcomingServices.map(s => ({...s, type: 'SERVICE', location: s.churchLocation}))]
          .sort((a,b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5);

    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
          createdBy: {
              select: {
                  firstName: true,
                  lastName: true,
              }
          }
      }
    });

    const notifications = await db.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const attendanceSummary = await db.attendance.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
            status: true
        }
    });

    return NextResponse.json({
      upcomingEvents,
      recentAnnouncements: announcements,
      notifications,
      attendanceSummary,
    });
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
