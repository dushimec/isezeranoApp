
import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Define Role type locally
export type Role = 'ADMIN' | 'SECRETARY' | 'DISCIPLINARIAN' | 'SINGER';

if (!process.env.JWT_SECRET) {
  // This check is important for server-side code.
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const issuer = 'urn:isezerano:issuer';
const audience = 'urn:isezerano:audience';
const expiresAt = '2h';

export async function createToken(userId: string, role: Role) {
  return await new SignJWT({ 'urn:isezerano:claim': true, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(userId)
    .setExpirationTime(expiresAt)
    .sign(secret);
}

type TokenPayload = {
    sub: string;
    role: Role;
} & import('jose').JWTPayload;


export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience,
    });
    return payload as TokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    return payload?.sub || null;
  } catch (error) {
    console.error("Error extracting user ID from token:", error);
    return null;
  }
}
