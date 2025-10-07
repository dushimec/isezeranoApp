
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { firstName, lastName, username, email, password, role } = await req.json();

  if (!firstName || !lastName || !username || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const fullName = `${firstName} ${lastName}`;
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: fullName,
    });

    const userProfile = {
      id: userRecord.uid,
      firstName,
      lastName,
      username,
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
    
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
    
    if (error.code === 'permission-denied') {
        const securityRuleRequest = {
            // This would be the admin user's auth context, which is complex to simulate here
            auth: {
                uid: 'ADMIN_UID_UNKNOWN_IN_THIS_CONTEXT',
            },
            method: 'create',
            path: `/databases/(default)/documents/users/${email}`,
            resource: {
                data: {
                    firstName,
                    lastName,
                    username,
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
