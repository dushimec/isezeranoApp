
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if(!ObjectId.isValid(id)){
        return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const notification = await db.collection('notifications').findOne({ 
        _id: new ObjectId(id),
        userId: new ObjectId(userId)
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    const updatedNotification = await db.collection('notifications').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { isRead: true } },
        { returnDocument: 'after' }
    );

    return NextResponse.json(updatedNotification);
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
