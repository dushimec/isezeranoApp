
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { UserDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection<UserDocument>('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          forcePasswordChange: false, // Update the flag
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
