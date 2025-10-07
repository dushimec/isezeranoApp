
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { phoneNumber } = await req.json();

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  try {
    // Check if user exists in Firebase Auth
    await getAuth().getUserByPhoneNumber(phoneNumber);
    // If user exists, we can proceed with sending OTP on the client.
    // This endpoint is just for validation before attempting client-side signInWithPhoneNumber
    return NextResponse.json({ message: 'User found, proceed with OTP.' });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User with this phone number is not registered.' }, { status: 404 });
    }
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
