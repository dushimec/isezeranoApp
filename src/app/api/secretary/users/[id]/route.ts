
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

// Get a single user by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const { id } = await params; 

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, {
            projection: { password: 0 }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ ...user, id: user._id.toHexString() });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// Update a user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const { id } = await params;
        const { firstName, lastName, email, username, role, isActive } = await req.json();

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const updateData: any = { $set: {} };
        if (firstName) updateData.$set.firstName = firstName;
        if (lastName) updateData.$set.lastName = lastName;
        if (email) updateData.$set.email = email;
        if (username) updateData.$set.username = username;
        if (role) updateData.$set.role = role;
        if (typeof isActive === 'boolean') updateData.$set.isActive = isActive;
        updateData.$set.updatedAt = new Date();


        const result = await db.collection('users').updateOne({ _id: new ObjectId(id) }, updateData);

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// Delete a user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
