import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, date, time, churchLocation, attire, notes } = await req.json();

    if (!title || !date || !time || !churchLocation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        title,
        date: new Date(date),
        time,
        churchLocation,
        attire,
        notes,
        createdById: userId,
      },
    });

    // TODO: Trigger notifications for singers

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                date: 'desc'
            }
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
