
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { phoneNumber } = await req.json();

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE phoneNumber = $1', [phoneNumber]);

    if (user.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For now, we'll just return a success message.
    // In a real application, you would generate and send an OTP here.
    return NextResponse.json({ message: 'OTP has been sent' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
