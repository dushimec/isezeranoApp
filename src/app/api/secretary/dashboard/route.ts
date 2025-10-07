
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const attendanceSummary = await pool.query(
      'SELECT status, COUNT(*) as count FROM attendance GROUP BY status'
    );
    const upcomingEvents = await pool.query(
      '(SELECT id, date, time, location, \'rehearsal\' as type FROM rehearsals WHERE date >= NOW()) UNION (SELECT id, date, churchLocation as location, null as time, \'service\' as type FROM services WHERE date >= NOW()) ORDER BY date ASC LIMIT 5'
    );

    return NextResponse.json({
      attendanceSummary: attendanceSummary.rows,
      upcomingEvents: upcomingEvents.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
