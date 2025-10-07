
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@/lib/types';
import cloudinary from '@/lib/cloudinary';


export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({...user, id: user._id.toHexString()});
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, username, email, profileImage } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const updateData: any = { updatedAt: new Date() };
    if(firstName) updateData.firstName = firstName;
    if(lastName) updateData.lastName = lastName;
    if(username) updateData.username = username;
    if(email) updateData.email = email;
    
    if (profileImage) {
        const user = await db.collection<UserDocument>('users').findOne({ _id: new ObjectId(userId) });
        if (user) {
            const uploadResult = await cloudinary.uploader.upload(profileImage, {
                folder: 'isezerano_cms_avatars',
                public_id: user.username || userId,
            });
            updateData.profileImage = uploadResult.secure_url;
        }
    }


    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    
    if(!result) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    // Basic check for duplicate key error from MongoDB
    if(error.code === 11000) {
        return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
