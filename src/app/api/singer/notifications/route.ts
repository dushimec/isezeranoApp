
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await pool.query(
      'SELECT * FROM notifications WHERE userId = $1 ORDER BY createdAt DESC', 
      [userId]
    );

    return NextResponse.json(notifications.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
