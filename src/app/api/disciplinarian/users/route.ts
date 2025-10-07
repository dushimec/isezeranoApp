
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection('users').find(
      { role: { $in: ['SINGER', 'DISCIPLINARIAN', 'SECRETARY'] as Role[] } },
      { 
          projection: { 
            _id: 1, 
            firstName: 1,
            lastName: 1, 
            role: 1,
            profileImage: 1
          },
          sort: { 
              firstName: 'asc' 
          },
      }
    ).toArray();
    
    const formattedUsers = users.map(u => ({
        id: u._id.toHexString(),
        fullName: `${u.firstName} ${u.lastName}`,
        profileImage: u.profileImage,
        role: u.role
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
