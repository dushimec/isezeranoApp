
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const userCounts = await db.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const totalUsers = await db.user.count();

    const formattedUserCounts = userCounts.reduce((acc, count) => {
        acc[count.role] = count._count.role;
        return acc;
    }, {} as Record<Role, number>);


    const upcomingRehearsals = db.rehearsal.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5
    });
    const upcomingServices = db.service.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5
    });
    
    const [rehearsals, services] = await Promise.all([upcomingRehearsals, upcomingServices]);

    const upcomingEvents = [...rehearsals.map(r => ({...r, type: 'REHEARSAL', location: r.location})), ...services.map(s => ({...s, type: 'SERVICE', location: s.churchLocation}))]
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);


    const recentAnnouncements = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      totalUsers,
      userCounts: formattedUserCounts,
      upcomingEvents,
      recentAnnouncements,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
