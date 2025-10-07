
import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '../../admin/events/route';


async function GET(req: NextRequest) {
    try {
        const events = await getAllEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events for secretary:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
