
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
    const adminResponse = await adminAuth(req);
    if (adminResponse) return adminResponse;

    try {
        const attendance = await db.attendance.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                },
                event: {
                    select: {
                        title: true,
                    }
                }
            }
        });
        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
