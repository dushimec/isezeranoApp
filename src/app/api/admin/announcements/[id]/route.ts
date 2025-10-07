import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { title, message, priority } = await req.json();
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        message,
        priority,
      },
    });
    return NextResponse.json(updatedAnnouncement);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.announcement.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
