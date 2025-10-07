
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

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

    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const { title, date, time, churchLocation, attire, notes } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {};
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (churchLocation) updateData.churchLocation = churchLocation;
    if (attire) updateData.attire = attire;
    if (notes) updateData.notes = notes;
    updateData.updatedAt = new Date();

    const result = await db.collection('services').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (title) {
        await db.collection('notifications').updateMany(
            { serviceId: new ObjectId(id) },
            { $set: { message: `Service updated: ${title}` } }
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
