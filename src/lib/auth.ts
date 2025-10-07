
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function getUserIdFromToken(req: NextRequest): Promise<number | null> {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as number;
  } catch (error) {
    return null;
  }
}
