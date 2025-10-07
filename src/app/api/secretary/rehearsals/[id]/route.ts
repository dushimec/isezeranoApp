
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid rehearsal ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const rehearsal = await db.collection('rehearsals').findOne({ _id: new ObjectId(id) });

    if (!rehearsal) {
      return NextResponse.json({ error: 'Rehearsal not found' }, { status: 404 });
    }

    return NextResponse.json(rehearsal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid rehearsal ID' }, { status: 400 });
    }

    const { title, date, time, location, notes } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {};
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (notes) updateData.notes = notes;
    updateData.updatedAt = new Date();

    const result = await db.collection('rehearsals').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Rehearsal not found' }, { status: 404 });
    }

    if (title) {
        await db.collection('notifications').updateMany(
            { rehearsalId: new ObjectId(id) },
            { $set: { message: `Rehearsal updated: ${title}` } }
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
      return NextResponse.json({ error: 'Invalid rehearsal ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('rehearsals').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Rehearsal not found' }, { status: 404 });
    }

    await db.collection('notifications').deleteMany({ rehearsalId: new ObjectId(id) });

    return NextResponse.json({ message: 'Rehearsal deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
