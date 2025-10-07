
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { SignJWT } from 'jose';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { USER_ROLES } from '@/lib/user-roles';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-that-is-long');

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { idToken, uid, fullName, phoneNumber, role } = await req.json();

  if (!idToken || !uid || !fullName || !phoneNumber || !role) {
    return NextResponse.json({ error: 'Missing required fields for registration' }, { status: 400 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const db = firestore();
    
    if (role === USER_ROLES.ADMIN) {
      const adminQuery = await db.collection('users').where('role', '==', USER_ROLES.ADMIN).limit(1).get();
      if (!adminQuery.empty) {
        return NextResponse.json({ error: 'An admin account already exists.' }, { status: 403 });
      }
    }

    const userRef = db.collection('users').doc(uid);
    const now = new Date();
    const userProfile = {
      id: uid,
      fullName,
      phoneNumber,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      profileImageUrl: `https://picsum.photos/seed/${uid}/400/400`,
    };

    await userRef.set(userProfile);
    
    const token = await new SignJWT({ userId: uid, role: userProfile.role, phone: userProfile.phoneNumber })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ token, user: userProfile });

  } catch (error: any) {
    console.error('Error during user registration:', error);

    // Check for Firestore permission error specifically
    if (error.code === 'permission-denied') {
        const securityRuleRequest = {
            auth: {
                uid: uid,
                token: {
                    phone_number: phoneNumber
                }
            },
            method: 'create',
            path: `/databases/(default)/documents/users/${uid}`,
            resource: {
                data: {
                    id: uid,
                    fullName,
                    phoneNumber,
                    role,
                    isActive: true,
                }
            }
        };

        const errorMessage = `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(securityRuleRequest, null, 2)}`;
        
        return NextResponse.json({ 
            error: 'Firestore permission denied.',
            details: errorMessage
        }, { status: 403 });
    }

    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
