
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getUserIdFromToken } from '@/lib/auth';
import { UserDocument } from '@/lib/types';

const formatService = (service: any) => {
    const { _id, ...rest } = service;
    return { id: _id.toHexString(), ...rest };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const service = await db.collection('services').findOne({ _id: new ObjectId(id) });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(formatService(service));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const { title, date, time, churchLocation, attire, notes, serviceType } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {};
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (churchLocation) updateData.churchLocation = churchLocation;
    if (attire) updateData.attire = attire;
    if (notes) updateData.notes = notes;
    if (serviceType) updateData.serviceType = serviceType;
    updateData.updatedAt = new Date();

    const result = await db.collection('services').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Notify singers of the update
    const singers = await db.collection<UserDocument>('users').find({ role: 'SINGER' }).project({ _id: 1 }).toArray();
    const creator = await db.collection<UserDocument>('users').findOne({_id: new ObjectId(userId)});
    
    if (singers.length > 0 && creator) {
      const notifications = singers.map(singer => ({
        userId: singer._id,
        serviceId: new ObjectId(id),
        title: 'Service Updated',
        message: `The service "${title}" has been updated.`,
        senderRole: creator.role,
        isRead: false,
        createdAt: new Date(),
      }));
      await db.collection('notifications').insertMany(notifications);
    }

    return NextResponse.json(formatService(result));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await db.collection('notifications').deleteMany({ serviceId: new ObjectId(id) });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
