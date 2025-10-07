
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

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
