import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify, SignJWT } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const issuer = 'urn:isezerano:issuer';
const audience = 'urn:isezerano:audience';
const expiresAt = '2h';

export async function createToken(userId: string, role: string) {
  return await new SignJWT({ 'urn:isezerano:claim': true, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(userId)
    .setExpirationTime(expiresAt)
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience,
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUserIdFromToken(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.sub || null;
}


// Higher-order function for API route authentication
export const withAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user information to the request object
    // @ts-ignore
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    return handler(req, res);
  };
};
