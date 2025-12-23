
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { EventType } from '@/lib/types';
import { checkAbsencePunishment, checkLateness } from '@/lib/punishments';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const attendanceRecords = await db.collection('attendance').aggregate([
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $lookup: { from: 'rehearsals', localField: 'eventId', foreignField: '_id', as: 'rehearsal' } },
        { $lookup: { from: 'services', localField: 'eventId', foreignField: '_id', as: 'service' } },
        { $unwind: { path: '$rehearsal', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    ]).toArray();

    const formattedAttendance = attendanceRecords.map(a => {
        const event = a.rehearsal || a.service;
        return {
            id: a._id.toHexString(),
            status: a.status,
            userName: `${a.user.firstName} ${a.user.lastName}`,
            eventType: a.eventType,
            eventDate: event?.date ?? a.createdAt,
            eventTitle: event?.title ?? 'Deleted Event',
            session: a.session,
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
        const { eventId, eventType, attendanceData, markedById, session } = await req.json();
        const langHeader = req.headers.get('accept-language')?.split(',')?.[0];
        const locale = langHeader ? (langHeader.startsWith('rw') ? 'rw' : langHeader.startsWith('en') ? 'eng' : undefined) as any : undefined;

        if (!eventId || !eventType || !Array.isArray(attendanceData) || !markedById) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // For services we require a session identifier to support per-session attendance
        if (eventType === 'SERVICE' && !session) {
            return NextResponse.json({ error: 'Session is required for services' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();

        const collectionName = eventType.toLowerCase() + 's';
        const event = await db.collection(collectionName).findOne({ _id: new ObjectId(eventId) });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const validStatuses = ['PRESENT', 'ABSENT', 'LATE'] as const;

        // Basic validation for attendance entries
        for (const entry of attendanceData) {
            const { userId, status } = entry as { userId?: string; status?: string };
            if (!userId || !status) {
                return NextResponse.json({ error: 'Each attendance entry must include userId and status' }, { status: 400 });
            }
            if (!validStatuses.includes(status as any)) {
                return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
            }
            if (!ObjectId.isValid(userId)) {
                return NextResponse.json({ error: `Invalid userId: ${userId}` }, { status: 400 });
            }
        }

        if (markedById && !ObjectId.isValid(markedById)) {
            return NextResponse.json({ error: 'Invalid markedById' }, { status: 400 });
        }

        const operations = attendanceData.map(({ userId, status }) => ({
            updateOne: {
                filter: Object.assign({
                    userId: new ObjectId(userId),
                    eventId: new ObjectId(eventId),
                }, eventType === 'SERVICE' && session ? { session } : {}),
                update: {
                    $set: Object.assign({
                        userId: new ObjectId(userId),
                        eventId: new ObjectId(eventId),
                        eventType,
                        status,
                        markedById: markedById ? new ObjectId(markedById) : undefined,
                        eventDate: event.date,
                        createdAt: new Date(),
                    }, eventType === 'SERVICE' && session ? { session } : {}),
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await db.collection('attendance').bulkWrite(operations);
        }

        // Check for punishments and warnings
        for (const { userId, status } of attendanceData) {
            if (status === 'ABSENT') {
                await checkAbsencePunishment(userId, eventType, session, locale);
            }
            if (status === 'LATE') {
                await checkLateness(userId, eventType, session, locale);
            }
        }

        return NextResponse.json({ message: 'Attendance recorded successfully' }, { status: 201 });

    } catch (error) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
