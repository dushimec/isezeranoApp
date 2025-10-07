import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const totalUsers = await prisma.user.count();

    const formattedUserCounts = userCounts.reduce((acc, count) => {
        acc[count.role] = count._count.role;
        return acc;
    }, {} as Record<Role, number>);


    const upcomingRehearsals = prisma.rehearsal.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5
    });
    const upcomingServices = prisma.service.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5
    });
    
    const [rehearsals, services] = await Promise.all([upcomingRehearsals, upcomingServices]);

    const upcomingEvents = [...rehearsals.map(r => ({...r, type: 'rehearsal'})), ...services.map(s => ({...s, type: 'service'}))]
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);


    const recentAnnouncements = await prisma.announcement.findMany({
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
