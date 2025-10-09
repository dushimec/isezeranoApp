
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/types';
import cloudinary from '@/lib/cloudinary';

// Create a new singer (Secretary only)
export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, role, password, username, profileImage } = await req.json();

    if (!firstName || !lastName || !password || !username) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser && email) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let finalProfileImage;
    if (profileImage) {
        const uploadResult = await cloudinary.uploader.upload(profileImage, {
            folder: 'isezerano_cms_avatars',
            public_id: username,
        });
        finalProfileImage = uploadResult.secure_url;
    } else {
        finalProfileImage = `https://picsum.photos/seed/${username}/100/100`;
    }

    const result = await db.collection('users').insertOne({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        role: role as Role,
        isActive: true,
        forcePasswordChange: true,
        profileImage: finalProfileImage,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    
    const newUser = {
        _id: result.insertedId,
        firstName,
        lastName,
        email,
        username,
        role: 'Singer',
        profileImage: finalProfileImage,
        createdAt: new Date(),
        isActive: true,
        forcePasswordChange: true,
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Get all users (for reports)
export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const users = await db.collection('users').find({}, {
            projection: { password: 0 }
        }).toArray();

        return NextResponse.json(users.map(u => ({...u, id: u._id.toHexString()})));
    } catch (error) {
        console.error('Error fetching users for secretary:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
