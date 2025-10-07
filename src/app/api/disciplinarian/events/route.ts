
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const upcomingRehearsals = await db.collection('rehearsals').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).toArray();
    const upcomingServices = await db.collection('services').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).toArray();
    
    const upcomingEvents = [
        ...upcomingRehearsals.map(r => ({id: r._id.toHexString(), title: r.title, date: r.date, type: 'REHEARSAL'})), 
        ...upcomingServices.map(s => ({id: s._id.toHexString(), title: s.title, date: s.date, type: 'SERVICE'}))
    ].sort((a,b) => a.date.getTime() - b.date.getTime());


    return NextResponse.json(upcomingEvents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
