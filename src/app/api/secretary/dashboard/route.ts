
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const attendanceSummaryCursor = db.collection('attendance').aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const attendanceSummary = await attendanceSummaryCursor.toArray();
    const formattedSummary = attendanceSummary.map(s => ({ status: s._id, _count: { status: s.count } }));


    const upcomingRehearsals = await db.collection('rehearsals').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();
    const upcomingServices = await db.collection('services').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();

    const upcomingEvents = [...upcomingRehearsals.map(r => ({...r, type: 'REHEARSAL', location: r.location})), ...upcomingServices.map(s => ({...s, type: 'SERVICE', location: s.churchLocation}))]
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);
    
    const recentAnnouncements = await db.collection('announcements').find({}).sort({ createdAt: 'desc' }).limit(5).toArray();


    return NextResponse.json({
      attendanceSummary: formattedSummary,
      upcomingEvents: upcomingEvents.map(e => ({...e, id: e._id.toHexString()})),
      recentAnnouncements: recentAnnouncements.map(a => ({...a, id: a._id.toHexString()}))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
