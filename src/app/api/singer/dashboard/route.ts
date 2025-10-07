
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const upcomingEvents = await pool.query(
      '(SELECT id, date, time, location, \'rehearsal\' as type FROM rehearsals WHERE date >= NOW()) UNION (SELECT id, date, churchLocation as location, null as time, \'service\' as type FROM services WHERE date >= NOW()) ORDER BY date ASC LIMIT 5'
    );

    const announcements = await pool.query('SELECT * FROM announcements ORDER BY createdAt DESC LIMIT 5');

    const notifications = await pool.query(
      'SELECT * FROM notifications WHERE userId = $1 AND isRead = false ORDER BY createdAt DESC LIMIT 5', 
      [userId]
    );

    const attendanceSummary = await pool.query(
      'SELECT status, COUNT(*) as count FROM attendance WHERE userId = $1 GROUP BY status', 
      [userId]
    );

    return NextResponse.json({
      upcomingEvents: upcomingEvents.rows,
      announcements: announcements.rows,
      notifications: notifications.rows,
      attendanceSummary: attendanceSummary.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
