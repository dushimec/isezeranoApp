
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const attendance = await pool.query(
      `SELECT 
          a.id,
          a.status,
          u.fullName as user_name,
          CASE
              WHEN a.rehearsalId IS NOT NULL THEN 'Rehearsal'
              WHEN a.serviceId IS NOT NULL THEN 'Service'
              ELSE 'Event'
          END as event_type,
          COALESCE(r.date::text, s.date::text) as event_date
      FROM attendance a
      JOIN users u ON a.userId = u.id
      LEFT JOIN rehearsals r ON a.rehearsalId = r.id
      LEFT JOIN services s ON a.serviceId = s.id
      ORDER BY event_date DESC`
    );

    return NextResponse.json(attendance.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
