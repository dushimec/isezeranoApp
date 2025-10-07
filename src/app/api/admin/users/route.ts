
import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore } from 'firebase-admin';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { USER_ROLES } from '@/lib/user-roles';

export async function GET(req: NextRequest) {
  try {
    await initFirebaseAdmin();
    const db = adminFirestore();
    const usersSnapshot = await db.collection('users').orderBy('fullName', 'asc').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await initFirebaseAdmin();
  const { fullName, phoneNumber, role } = await req.json();

  if (!fullName || !phoneNumber || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Note: This endpoint only creates a Firestore user profile.
  // The user must be created in Firebase Authentication separately for them to log in.
  // This is a simplified flow for demonstration. A real-world app might use a Cloud Function
  // triggered by Auth user creation to create the Firestore profile.

  try {
    const db = adminFirestore();
    
    // We'll use a transaction to ensure we don't have duplicate phone numbers
    const usersRef = db.collection('users');
    const existingUserQuery = await usersRef.where('phoneNumber', '==', phoneNumber).limit(1).get();

    if (!existingUserQuery.empty) {
      return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 409 });
    }

    const newUserRef = db.collection('users').doc();
    const now = new Date();
    const userProfile = {
      id: newUserRef.id,
      fullName,
      phoneNumber,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      profileImageUrl: `https://picsum.photos/seed/${newUserRef.id}/400/400`,
    };

    await newUserRef.set(userProfile);

    return NextResponse.json(userProfile, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user profile:', error);

    // Check for Firestore permission error specifically
    if (error.code === 'permission-denied') {
        const securityRuleRequest = {
            // We can't know the exact auth context from an admin SDK call,
            // but we can simulate what the rule would see for a client write.
            auth: {
                uid: 'ADMIN_UID_UNKNOWN', // Placeholder
                token: { role: 'Admin' }
            },
            method: 'create',
            path: `/databases/(default)/documents/users/NEW_USER_ID`,
            resource: {
                data: {
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

    return NextResponse.json({ error: 'Internal server error during user creation' }, { status: 500 });
  }
}
