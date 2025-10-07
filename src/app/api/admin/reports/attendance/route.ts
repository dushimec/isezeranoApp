
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { sub, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import * as XLSX from 'xlsx';

async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period');

        let startDate: Date;
        const now = new Date();

        switch (period) {
            case 'this-month':
                startDate = startOfMonth(now);
                break;
            case 'last-3-months':
                startDate = sub(now, { months: 3 });
                break;
            case 'last-6-months':
                startDate = sub(now, { months: 6 });
                break;
            case 'this-year':
                startDate = startOfYear(now);
                break;
            default: // default to this month
                startDate = startOfMonth(now);
                break;
        }

        const client = await clientPromise;
        const db = client.db();

        const attendanceRecords = await db.collection('attendance').aggregate([
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $lookup: { from: 'rehearsals', localField: 'eventId', foreignField: '_id', as: 'rehearsal' } },
            { $lookup: { from: 'services', localField: 'eventId', foreignField: '_id', as: 'service' } },
            { $unwind: { path: '$rehearsal', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    event: { $ifNull: ['$rehearsal', '$service'] }
                }
            },
            {
                $match: {
                    'user.role': 'SINGER',
                    'event.date': { $gte: startDate }
                }
            },
            { $sort: { 'event.date': 1, 'user.lastName': 1, 'user.firstName': 1 } },
            {
                $project: {
                    _id: 0,
                    singerName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    eventTitle: '$event.title',
                    eventDate: { $dateToString: { format: "%Y-%m-%d", date: "$event.date" } },
                    eventType: '$eventType',
                    status: '$status'
                }
            }
        ]).toArray();

        if (attendanceRecords.length === 0) {
            return NextResponse.json({ message: 'No attendance data for the selected period.' }, { status: 404 });
        }

        const worksheet = XLSX.utils.json_to_sheet(attendanceRecords);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        
        // Set column widths
        worksheet['!cols'] = [
            { wch: 25 }, // singerName
            { wch: 30 }, // eventTitle
            { wch: 15 }, // eventDate
            { wch: 15 }, // eventType
            { wch: 15 }, // status
        ];

        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="attendance-report-${period}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

    } catch (error) {
        console.error('Error generating attendance report:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
