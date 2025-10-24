
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { EventType } from '@/lib/types';
import { checkAbsencePunishment, checkLateness } from '@/lib/punishments';

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
        const lang = req.headers.get('accept-language')?.split(',')?.[0];

        if (!eventId || !eventType || !Array.isArray(attendanceData) || !markedById) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();

        const collectionName = eventType.toLowerCase() + 's';
        const event = await db.collection(collectionName).findOne({ _id: eventId });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const operations = attendanceData.map(({ userId, status }) => ({
            updateOne: {
                filter: {
                    userId: userId,
                    eventId: eventId
                },
                update: {
                    $set: {
                        userId: userId,
                        eventId: eventId,
                        eventType,
                        status,
                        markedById: markedById,
                        eventDate: event.date, 
                        session: eventType === 'SERVICE' ? session : undefined,
                        createdAt: new Date(),
                    }
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
                await checkAbsencePunishment(userId, lang, eventType, session);
            }
            if (status === 'LATE') {
                await checkLateness(userId, lang, eventType, session);
            }
        }

        return NextResponse.json({ message: 'Attendance recorded successfully' }, { status: 201 });

    } catch (error) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
