
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // This operation is now handled on the client-side to properly enforce security rules
  // and provide contextual errors.
  return NextResponse.json({ error: 'This operation should be performed on the client.' }, { status: 405 });
}
