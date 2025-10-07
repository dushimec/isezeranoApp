
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function getAllEvents() {
    const client = await clientPromise;
    const db = client.db();

    const rehearsals = await db.collection('rehearsals').find({}).sort({ date: -1 }).toArray();
    const services = await db.collection('services').find({}).sort({ date: -1 }).toArray();
    
    const attendance = await db.collection('attendance').find({}).toArray();
    const attendanceByEvent = attendance.reduce((acc, curr) => {
        const eventId = curr.eventId.toHexString();
        if (!acc[eventId]) {
            acc[eventId] = [];
        }
        acc[eventId].push({ userId: curr.userId.toHexString() });
        return acc;
    }, {} as Record<string, {userId: string}[]>);

    const events = [
        ...rehearsals.map(r => ({
            id: r._id.toHexString(), 
            title: r.title,
            date: r.date,
            type: 'REHEARSAL',
            attendees: attendanceByEvent[r._id.toHexString()] || [],
            location: r.location
        })),
        ...services.map(s => ({ 
            id: s._id.toHexString(),
            title: s.title,
            date: s.date,
            type: 'SERVICE',
            attendees: attendanceByEvent[s._id.toHexString()] || [],
            location: s.churchLocation
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return events;
}


async function GET(req: NextRequest) {
    try {
        const events = await getAllEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
