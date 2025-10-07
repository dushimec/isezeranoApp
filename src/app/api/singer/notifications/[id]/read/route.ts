import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
        where: { id }
    });

    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });

    return NextResponse.json(updatedNotification);
  } catch (error: any) {
    console.error(error);
    if(error.message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
