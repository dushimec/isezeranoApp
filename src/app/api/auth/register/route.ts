
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { USER_ROLES } from '@/lib/user-roles';

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { fullName, email, password } = await req.json();

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields for registration' }, { status: 400 });
  }

  try {
    const db = firestore();
    
    // Check if an admin already exists
    const adminQuery = await db.collection('users').where('role', '==', USER_ROLES.ADMIN).limit(1).get();
    if (!adminQuery.empty) {
      return NextResponse.json({ error: 'An admin account already exists. Please log in.' }, { status: 403 });
    }
    
    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
        email,
        password,
        displayName: fullName,
    });

    const uid = userRecord.uid;
    const userRef = db.collection('users').doc(uid);
    const now = new Date();
    const userProfile = {
      id: uid,
      fullName,
      email,
      role: USER_ROLES.ADMIN,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      profileImageUrl: `https://picsum.photos/seed/${uid}/400/400`,
    };

    await userRef.set(userProfile);

    // No token is returned here, user must log in after registration
    return NextResponse.json({ message: "Admin user created successfully", user: userProfile });

  } catch (error: any) {
    console.error('Error during admin registration:', error);

    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'This email is already in use.'}, { status: 409 });
    }

    if (error.code === 'permission-denied') {
        const securityRuleRequest = {
            method: 'create',
            path: `/databases/(default)/documents/users/${email}`,
            resource: {
                data: {
                    fullName,
                    email,
                    role: USER_ROLES.ADMIN,
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
    
    return NextResponse.json({ error: 'An internal error occurred.', details: error.message }, { status: 500 });
  }
}
