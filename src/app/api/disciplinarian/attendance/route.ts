import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EventType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
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

    const formattedAttendance = attendanceRecords.map(a => {
        let event;
        if(a.eventType === EventType.REHEARSAL) {
            event = a.rehearsal
        } else {
            event = a.service;
        }

        return {
            id: a.id,
            status: a.status,
            userName: `${a.user.firstName} ${a.user.lastName}`,
            eventType: a.eventType,
            eventDate: event?.date,
            eventTitle: event?.title,
        }
    })

    return NextResponse.json(formattedAttendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const { eventId, eventType, attendanceData, markedById } = await req.json();

        if (!eventId || !eventType || !Array.isArray(attendanceData) || !markedById) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transactions = attendanceData.map(({ userId, status }) => {
           return prisma.attendance.create({
                data: {
                    userId,
                    eventId,
                    eventType,
                    status,
                    markedById
                }
            })
        });

        await prisma.$transaction(transactions);

        return NextResponse.json({ message: 'Attendance recorded successfully' }, { status: 201 });

    } catch (error) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
