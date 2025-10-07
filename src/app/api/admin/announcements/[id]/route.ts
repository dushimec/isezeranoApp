
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    // This should be handled on the client-side to enforce security rules
    return NextResponse.json({ error: 'This operation should be performed on the client.' }, { status-code: 405 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    // This should be handled on the client-side to enforce security rules
    return NextResponse.json({ error: 'This operation should be performed on the client.' }, { status-code: 405 });
}
