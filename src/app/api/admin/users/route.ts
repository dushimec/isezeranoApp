
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const users = await pool.query('SELECT id, fullName, phoneNumber, role FROM users ORDER BY fullName ASC');
    return NextResponse.json(users.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, phoneNumber, role } = await req.json();
    const result = await pool.query(
      'INSERT INTO users (fullName, phoneNumber, role) VALUES ($1, $2, $3) RETURNING id, fullName, phoneNumber, role',
      [fullName, phoneNumber, role]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
