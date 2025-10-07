
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const announcements = await db.collection('announcements').aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: '$createdBy' },
        {
            $project: {
                title: 1,
                message: 1,
                priority: 1,
                createdAt: 1,
                'createdBy.firstName': 1,
                'createdBy.lastName': 1,
            }
        }
    ]).toArray();

    return NextResponse.json(announcements.map(a => ({...a, id: a._id.toHexString()})));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
