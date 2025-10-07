
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@/lib/types';


export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const announcements = await db.collection('announcements').aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: '$createdBy' },
        {
            $project: {
                title: 1,
                message: 1,
                priority: 1,
                createdAt: 1,
                'createdBy.firstName': 1,
                'createdBy.lastName': 1,
            }
        }
    ]).toArray();


    return NextResponse.json(announcements.map(a => ({...a, id: a._id.toHexString()})));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, priority } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const newAnnouncement = {
        title,
        message,
        priority,
        createdById: new ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await db.collection('announcements').insertOne(newAnnouncement);
    const announcementId = result.insertedId;
    
    // Create notifications for all singers
    const singers = await db.collection<UserDocument>('users').find({ role: 'SINGER' }, { projection: { _id: 1 } }).toArray();

    if (singers.length > 0) {
        const creator = await db.collection<UserDocument>('users').findOne({_id: new ObjectId(userId)});
        if (creator) {
            const notifications = singers.map(singer => ({
                userId: singer._id,
                announcementId: announcementId,
                title: 'New Announcement',
                message: newAnnouncement.title,
                senderRole: creator.role, 
                isRead: false,
                createdAt: new Date(),
            }));
            await db.collection('notifications').insertMany(notifications);
        }
    }

    return NextResponse.json({ ...newAnnouncement, id: announcementId.toHexString() }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
