
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = req.nextUrl.searchParams.get('session');
    const eventId = req.nextUrl.searchParams.get('eventId');

    // Always fetch singers (active)
    const users = await db.collection('users').find(
      { role: 'SINGER', isActive: true },
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          profileImage: 1,
        },
        sort: { firstName: 'asc' },
      }
    ).toArray();

    // If eventId is provided, fetch existing attendance records for that event (and session if provided)
    let attendanceByUser: Record<string, { status: string } | undefined> = {};
    if (eventId) {
      const filter: any = { eventId: new ObjectId(eventId) };
      if (session) filter.session = session;
      const attendanceRecords = await db.collection('attendance').find(filter).toArray();
      attendanceByUser = attendanceRecords.reduce((acc: Record<string, any>, r: any) => {
        acc[(r.userId && r.userId.toHexString) ? r.userId.toHexString() : String(r.userId)] = { status: r.status };
        return acc;
      }, {});
    }

    const formattedUsers = users.map(u => ({
      id: u._id.toHexString(),
      fullName: `${u.firstName} ${u.lastName}`,
      profileImage: u.profileImage,
      role: u.role,
      status: attendanceByUser[u._id.toHexString()]?.status,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
