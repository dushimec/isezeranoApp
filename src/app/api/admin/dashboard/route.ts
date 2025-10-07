
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const upcomingEvents = await pool.query(
      '(SELECT id, date, time, location, \'rehearsal\' as type FROM rehearsals WHERE date >= NOW()) UNION (SELECT id, date, churchLocation as location, null as time, \'service\' as type FROM services WHERE date >= NOW()) ORDER BY date ASC LIMIT 5'
    );
    const recentAnnouncements = await pool.query('SELECT * FROM announcements ORDER BY createdAt DESC LIMIT 5');

    return NextResponse.json({
      totalUsers: totalUsers.rows[0].count,
      upcomingEvents: upcomingEvents.rows,
      recentAnnouncements: recentAnnouncements.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
