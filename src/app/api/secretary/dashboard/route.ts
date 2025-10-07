import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const attendanceSummary = await prisma.attendance.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

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


    return NextResponse.json({
      attendanceSummary: attendanceSummary.map(item => ({ status: item.status, count: item._count.status })),
      upcomingEvents,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
