
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req: NextRequest) {
  const { phoneNumber, otp } = await req.json();

  if (!phoneNumber || !otp) {
    return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
  }

  // Hardcoded OTP for testing
  if (otp !== '123456') {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  try {
    const result = await pool.query('SELECT id, role FROM users WHERE phoneNumber = $1', [phoneNumber]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
