
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const upcomingRehearsals = await db.collection('rehearsals').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();
    const upcomingServices = await db.collection('services').find({ date: { $gte: new Date() } }).sort({ date: 'asc' }).limit(5).toArray();
  
    const upcomingEvents = [...upcomingRehearsals.map(r => ({...r, type: 'REHEARSAL', location: r.location})), ...upcomingServices.map(s => ({...s, type: 'SERVICE', location: s.churchLocation}))]
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    const announcements = await db.collection('announcements').aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: '$createdBy' }
    ]).toArray();

    const notifications = await db.collection('notifications').find({ 
        userId: new ObjectId(userId), 
        isRead: false 
    }).sort({ createdAt: 'desc' }).limit(5).toArray();

    const attendanceSummaryCursor = await db.collection('attendance').aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const attendanceSummary = attendanceSummaryCursor.map(s => ({ status: s._id, _count: { status: s.count } }));

    return NextResponse.json({
      upcomingEvents: upcomingEvents.map(e => ({...e, id: e._id.toHexString()})),
      recentAnnouncements: announcements.map(a => ({...a, id: a._id.toHexString()})),
      notifications: notifications.map(n => ({...n, id: n._id.toHexString()})),
      attendanceSummary,
    });
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
