
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { SignJWT } from 'jose';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-that-is-long');

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found in Firestore' }, { status: 404 });
    }
    
    const user = userDoc.data();

    const token = await new SignJWT({ userId: uid, role: user?.role, phone: user?.phoneNumber })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ token, user });

  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
