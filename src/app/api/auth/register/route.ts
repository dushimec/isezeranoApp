
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createToken } from '@/lib/auth';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, username, profileImage } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    // Check if an admin already exists
    const adminCount = await db.collection('users').countDocuments({ role: 'ADMIN' });
    if (adminCount > 0) {
        return NextResponse.json({ message: 'An admin account already exists.' }, { status: 403 });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const effectiveUsername = username || email.split('@')[0];
    
    let finalProfileImage;
    if (profileImage) {
        const uploadResult = await cloudinary.uploader.upload(profileImage, {
            folder: 'isezerano_cms_avatars',
            public_id: effectiveUsername
        });
        finalProfileImage = uploadResult.secure_url;
    } else {
        finalProfileImage = `https://picsum.photos/seed/${effectiveUsername}/100/100`;
    }

    const result = await db.collection('users').insertOne({
      firstName,
      lastName,
      email,
      username: effectiveUsername,
      password: hashedPassword,
      role: 'ADMIN' as Role,
      isActive: true,
      profileImage: finalProfileImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = {
        _id: result.insertedId,
        firstName,
        lastName,
        email,
        role: 'ADMIN' as Role,
    }

    const token = await createToken(result.insertedId.toHexString(), user.role as Role);

    return NextResponse.json({ 
        message: 'Admin registered successfully',
        token,
        user: {
            id: user._id.toHexString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
