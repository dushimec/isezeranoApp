
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function GET(req: NextRequest) {
    try {
        const rehearsals = await prisma.rehearsal.findMany({
            orderBy: { date: 'desc' },
            include: { attendance: { select: { userId: true } } }
        });

        const services = await prisma.service.findMany({
            orderBy: { date: 'desc' },
            include: { attendance: { select: { userId: true } } }
        });

        const events = [
            ...rehearsals.map(r => ({ ...r, type: 'REHEARSAL', attendees: r.attendance, location: r.location })),
            ...services.map(s => ({ ...s, type: 'SERVICE', attendees: s.attendance, location: s.churchLocation }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
