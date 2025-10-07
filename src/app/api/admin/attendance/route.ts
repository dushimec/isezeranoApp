
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function GET(req: NextRequest) {
    try {
        const attendanceRecords = await prisma.attendance.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                },
                rehearsal: {
                    select: {
                        title: true,
                        date: true,
                    }
                },
                service: {
                    select: {
                        title: true,
                        date: true,
                    }
                }
            }
        });

        const formattedAttendance = attendanceRecords.map(a => {
            const eventDetails = a.rehearsal || a.service;
            
            return {
                id: a.id,
                status: a.status,
                user: a.user,
                event: {
                    title: eventDetails?.title ?? 'Deleted Event',
                    date: eventDetails?.date ?? a.createdAt,
                }
            }
        });

        return NextResponse.json(formattedAttendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
