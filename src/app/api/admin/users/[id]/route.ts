
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Role } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

interface UserIdParams {
  params: { id: string } | Promise<{ id: string }>;
}

// Get a single user by ID (Admin only)
export async function GET(req: NextRequest, { params }: UserIdParams) {
  const { id } = await params;
   if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({...user, id: user._id.toHexString()});
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update a user (Admin only)
export async function PUT(req: NextRequest, { params }: UserIdParams) {
  const { id } = await params;
   if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

  try {
    const body = await req.json();
    console.log(`PUT /api/admin/users/${id} body:`, body);
    const { firstName, lastName, email, username, password, role, isActive } = body;
    
    const client = await clientPromise;
    const db = client.db();

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const updateData: any = {
        firstName,
        lastName,
        email,
        username,
        role: role as Role,
        isActive,
        updatedAt: new Date(),
    };

    if (hashedPassword) {
        updateData.password = hashedPassword;
    }


    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    
    if (!result) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Delete a user (Admin only)
export async function DELETE(req: NextRequest, { params }: UserIdParams) {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    try {
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
