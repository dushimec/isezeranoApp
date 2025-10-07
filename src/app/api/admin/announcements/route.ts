
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const announcements = await pool.query('SELECT * FROM announcements ORDER BY createdAt DESC');
    return NextResponse.json(announcements.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    const result = await pool.query(
      'INSERT INTO announcements (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
