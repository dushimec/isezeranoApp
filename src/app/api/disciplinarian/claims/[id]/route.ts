
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { ClaimStatus, UserDocument } from '@/lib/types';
import { getUserIdFromToken } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disciplinarianId = await getUserIdFromToken(req);
    if (!disciplinarianId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 });
    }

    const { status, resolutionNote } = await req.json();
    
    if (!status) {
        return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {
        status: status as ClaimStatus,
        updatedAt: new Date()
    };
    if (resolutionNote) updateData.resolutionNote = resolutionNote;

    const result = await db.collection('claims').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }
    
    // Create notification for the singer who submitted the claim
    const disciplinarian = await db.collection<UserDocument>('users').findOne({_id: new ObjectId(disciplinarianId)});

    if (result.submittedById && disciplinarian) {
        const notification = {
            userId: result.submittedById,
            claimId: result._id,
            title: `Your claim has been updated`,
            message: `Your claim "${result.title}" is now ${result.status}.`,
            senderRole: disciplinarian.role,
            isRead: false,
            createdAt: new Date(),
        };
        await db.collection('notifications').insertOne(notification);
    }


    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
          return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 });
        }
    
        const client = await clientPromise;
        const db = client.db();
    
        const claim = await db.collection('claims').findOne({ _id: new ObjectId(id) });
    
        if (!claim) {
          return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
        }
    
        return NextResponse.json({...claim, id: claim._id.toHexString()});
      } catch (error) {
        console.error('Error fetching claim:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}
