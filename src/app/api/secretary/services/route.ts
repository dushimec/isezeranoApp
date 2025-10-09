
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, date, time, churchLocation, attire, notes, serviceType } = await req.json();

    if (!title || !date || !time || !churchLocation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newService = {
        title,
        date: new Date(date),
        time,
        churchLocation,
        attire,
        notes,
        serviceType,
        createdById: new ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

    const result = await db.collection('services').insertOne(newService);
    const serviceId = result.insertedId;

    // Create notifications for all singers
    const singers = await db.collection<UserDocument>('users').find({ role: 'SINGER' }).project({ _id: 1 }).toArray();
    const creator = await db.collection<UserDocument>('users').findOne({_id: new ObjectId(userId)});
    
    if (singers.length > 0 && creator) {
      const notifications = singers.map(singer => ({
        userId: singer._id,
        serviceId: serviceId,
        title: 'New Service Scheduled',
        message: `A new service has been scheduled: ${title} on ${new Date(date).toLocaleDateString()}`,
        senderRole: creator.role,
        isRead: false,
        createdAt: new Date(),
      }));
      await db.collection('notifications').insertMany(notifications);
    }

    const createdService = {
        _id: serviceId,
        ...newService
    }

    return NextResponse.json(createdService, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
