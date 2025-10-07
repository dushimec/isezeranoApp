
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const rehearsals = await db.collection('rehearsals').find({}).sort({ date: -1 }).toArray();
        return NextResponse.json(rehearsals.map(r => ({...r, id: r._id.toHexString()})));
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
