
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
  const adminCount = await db.collection('users').countDocuments({ role: 'ADMIN' as Role });
  // Return the exact count and a convenience `exists` boolean for compatibility
  return NextResponse.json({ count: adminCount, exists: adminCount > 0 });
  } catch (error) {
    console.error('Error checking for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
