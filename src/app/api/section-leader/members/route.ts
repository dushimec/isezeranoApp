
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/auth/auth';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    const sectionLeaderId = decoded.userId;

    const sectionResult = await pool.query('SELECT section FROM users WHERE id = $1', [sectionLeaderId]);
    const section = sectionResult.rows[0]?.section;

    if (!section) {
        return NextResponse.json({ error: 'Section not found for this leader' }, { status: 404 });
    }

    const members = await pool.query('SELECT id, fullName FROM users WHERE section = $1', [section]);

    return NextResponse.json(members.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
