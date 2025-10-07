import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        rehearsal: true,
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedAttendance = attendance.map(a => {
        const event = a.rehearsal || a.service;
        return {
            id: a.id,
            status: a.status,
            user_name: `${a.user.firstName} ${a.user.lastName}`,
            event_type: a.eventType,
            event_date: event?.date,
            event_title: event?.title,
        }
    })

    return NextResponse.json(formattedAttendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
