
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    const { title, message, priority } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (priority) updateData.priority = priority;
    updateData.updatedAt = new Date();

    const result = await db.collection('announcements').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Optionally, update notifications if the title changed
    if (title) {
      await db.collection('notifications').updateMany(
        { announcementId: new ObjectId(id) },
        { $set: { message: `Announcement updated: ${title}` } }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('announcements').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Delete associated notifications
    await db.collection('notifications').deleteMany({ announcementId: new ObjectId(id) });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
