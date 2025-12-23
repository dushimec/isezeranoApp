
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const userCountsCursor = db.collection('users').aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    const userCountsArray = await userCountsCursor.toArray();
    const formattedUserCounts = userCountsArray.reduce((acc, count) => {
        acc[count._id as Role] = count.count;
        return acc;
    }, {} as Record<Role, number>);

    const totalUsers = await db.collection('users').countDocuments();

    const upcomingRehearsals = await db.collection('rehearsals').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();
    const upcomingServices = await db.collection('services').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();
    
    const upcomingEvents = [...upcomingRehearsals.map(r => ({...r, type: 'REHEARSAL'})), ...upcomingServices.map(s => ({...s, type: 'SERVICE'}))]
        .sort((a,b) => new Date((a as any).date).getTime() - new Date((b as any).date).getTime())
        .slice(0, 5);

    const recentAnnouncements = await db.collection('announcements').find().sort({ createdAt: 'desc' }).limit(5).toArray();

    return NextResponse.json({
      totalUsers,
      userCounts: formattedUserCounts,
      upcomingEvents: upcomingEvents.map(e => ({...e, id: e._id.toHexString()})),
      recentAnnouncements: recentAnnouncements.map(a => ({...a, id: a._id.toHexString()})),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
