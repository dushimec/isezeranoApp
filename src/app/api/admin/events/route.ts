
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
    const adminResponse = await adminAuth(req);
    if (adminResponse) return adminResponse;

    try {
        const events = await db.event.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                attendees: true,
            }
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
