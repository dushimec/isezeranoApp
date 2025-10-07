
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { SignJWT } from 'jose';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-that-is-long');

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  // This route is now deprecated in favor of direct email/password sign-in
  // but kept for reference or potential future use with other verification methods.
  return NextResponse.json({ error: 'This authentication method is not used.' }, { status: 404 });
}
