import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const upcomingRehearsals = prisma.rehearsal.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });
    const upcomingServices = prisma.service.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });
    
    const [rehearsals, services] = await Promise.all([upcomingRehearsals, upcomingServices]);

    const upcomingEvents = [
        ...rehearsals.map(r => ({id: r.id, title: r.title, date: r.date, type: 'REHEARSAL'})), 
        ...services.map(s => ({id: s.id, title: s.title, date: s.date, type: 'SERVICE'}))
    ].sort((a,b) => a.date.getTime() - b.date.getTime());


    return NextResponse.json(upcomingEvents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
