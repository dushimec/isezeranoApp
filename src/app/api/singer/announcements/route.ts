import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement MongoDB queries
    console.log("Fetching announcements...");

    // Placeholder data
    const announcements = [
        { id: '1', title: 'First Announcement', content: 'This is the first announcement.' },
        { id: '2', title: 'Second Announcement', content: 'This is the second announcement.' },
    ];

    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
