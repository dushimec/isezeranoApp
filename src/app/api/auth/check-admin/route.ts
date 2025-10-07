
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const adminCount = await db.collection('users').countDocuments({ role: 'ADMIN' as Role });
    return NextResponse.json({ exists: adminCount > 0 });
  } catch (error) {
    console.error('Error checking for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
