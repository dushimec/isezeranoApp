
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, date, time, location, notes } = await req.json();

    if (!title || !date || !time || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newRehearsal = {
      title,
      date: new Date(date),
      time,
      location,
      notes,
      createdById: new ObjectId(userId),
      createdAt: new Date(),
    };

    const result = await db.collection('rehearsals').insertOne(newRehearsal);
    const rehearsalId = result.insertedId;

    // Create notifications for all singers
    const singers = await db.collection('users').find({ role: 'SINGER' }).project({ _id: 1 }).toArray();
    if (singers.length > 0) {
      const notifications = singers.map(singer => ({
        userId: singer._id,
        rehearsalId: rehearsalId,
        message: `New rehearsal scheduled: ${title}`,
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

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const rehearsals = await db.collection('rehearsals').find({}).sort({ date: -1 }).toArray();
        return NextResponse.json(rehearsals);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
