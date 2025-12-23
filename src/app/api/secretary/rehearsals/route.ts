
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@/lib/types';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const rehearsals = await db.collection('rehearsals').find({}).toArray();
        const rehearsalsWithId = rehearsals.map(rehearsal => {
            const { _id, ...rest } = rehearsal;
            return { id: _id.toHexString(), ...rest };
        });
        return NextResponse.json(rehearsalsWithId, { status: 200 });
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
    
    const { title, date, time, notes } = await req.json();

    if (!title || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const singers = await db.collection<UserDocument>('users').find({ role: 'SINGER', isActive: true }).project({ _id: 1 }).toArray();
    const attendeeIds = singers.map(s => s._id);

    const newRehearsal = {
      title,
      date: new Date(date),
      time,
      notes,
      attendees: attendeeIds,
      createdById: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('rehearsals').insertOne(newRehearsal);
    const rehearsalId = result.insertedId;

    // Create notifications for all singers
    const creator = await db.collection<UserDocument>('users').findOne({_id: new ObjectId(userId)});
    
    if (attendeeIds.length > 0 && creator) {
      const notifications = attendeeIds.map(singerId => ({
        userId: singerId,
        rehearsalId: rehearsalId,
        title: 'New Rehearsal Scheduled',
        message: `A new rehearsal has been scheduled: ${title} on ${new Date(date).toLocaleDateString()}`,
        senderRole: creator.role,
        isRead: false,
        createdAt: new Date(),
      }));
      await db.collection('notifications').insertMany(notifications);
    }

    const createdRehearsal = {
      _id: rehearsalId,
      ...newRehearsal
    }

    return NextResponse.json(createdRehearsal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
