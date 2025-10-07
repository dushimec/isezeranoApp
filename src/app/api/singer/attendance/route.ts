
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const attendanceRecords = await db.collection('attendance').aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        { 
            $lookup: {
                from: 'rehearsals',
                localField: 'eventId',
                foreignField: '_id',
                as: 'rehearsal'
            }
        },
        { 
            $lookup: {
                from: 'services',
                localField: 'eventId',
                foreignField: '_id',
                as: 'service'
            }
        },
        { $unwind: { path: '$rehearsal', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    ]).toArray();

    const formattedRecords = attendanceRecords.map(record => {
        const event = record.rehearsal || record.service;
        return {
            id: record._id.toHexString(),
            status: record.status,
            event: {
                title: event?.title || 'Deleted Event',
                date: event?.date || record.createdAt
            }
        }
    })


    return NextResponse.json(formattedRecords);
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
