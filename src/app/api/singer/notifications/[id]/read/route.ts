
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      'UPDATE notifications SET isRead = true WHERE id = $1 AND userId = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
