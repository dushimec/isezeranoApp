
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { fullName, email, password, role } = await req.json();

  if (!fullName || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      fullName,
      email,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImageUrl: `https://picsum.photos/seed/${userRecord.uid}/400/400`,
    };

    await firestore().collection('users').doc(userRecord.uid).set(userProfile);

    return NextResponse.json({ ...userProfile }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    // Check for specific auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
     // Check for Firestore permission error specifically
    if (error.code === 'permission-denied') {
        const securityRuleRequest = {
            auth: {
                // This would be the admin user's auth context, which is complex to simulate here
                uid: 'ADMIN_UID_UNKNOWN_IN_THIS_CONTEXT',
            },
            method: 'create',
            path: `/databases/(default)/documents/users/${email}`, // Simplified path
            resource: {
                data: {
                    fullName,
                    email,
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
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
