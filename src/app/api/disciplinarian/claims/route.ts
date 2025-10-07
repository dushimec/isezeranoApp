
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Example of filtering by status from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const claims = await db.collection('claims').aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'submittedById',
                foreignField: '_id',
                as: 'submittedBy'
            }
        },
        { $unwind: '$submittedBy' },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                status: 1,
                severity: 1,
                isAnonymous: 1,
                createdAt: 1,
                updatedAt: 1,
                submittedBy: {
                    firstName: '$submittedBy.firstName',
                    lastName: '$submittedBy.lastName',
                    profileImage: '$submittedBy.profileImage'
                }
            }
        }
    ]).toArray();

    const formattedClaims = claims.map(c => {
        if (c.isAnonymous) {
            c.submittedBy = {
                firstName: 'Anonymous',
                lastName: '',
                profileImage: ''
            }
        }
        return {
            ...c,
            id: c._id.toHexString()
        }
    });

    return NextResponse.json(formattedClaims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
