
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const attendanceSummary = await db.attendance.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

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
    
    const recentAnnouncements = await db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
    });


    return NextResponse.json({
      attendanceSummary,
      upcomingEvents,
      recentAnnouncements
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
