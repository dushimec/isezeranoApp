
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const attendanceSummaryCursor = await db.collection('attendance').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const formattedSummary = attendanceSummaryCursor.map(item => ({
        status: item._id,
        _count: {
            status: item.count
        }
    }));

    return NextResponse.json({
      attendanceSummary: formattedSummary,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
