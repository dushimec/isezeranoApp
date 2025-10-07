import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: { 
          id: true, 
          firstName: true,
          lastName: true, 
          role: true 
      },
      orderBy: { 
          firstName: 'asc' 
      },
    });
    
    // Combine firstName and lastName into fullName
    const formattedUsers = users.map(u => ({
        ...u,
        fullName: `${u.firstName} ${u.lastName}`
    }))

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
