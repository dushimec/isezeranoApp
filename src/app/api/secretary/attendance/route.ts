
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const attendanceRecords = await db.collection('attendance').aggregate([
            { $sort: { createdAt: -1 } },
            { 
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user'},
             { 
                $lookup: {
                    from: 'rehearsals',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'rehearsal'
                }
            },
             { 
                $lookup: {
                    from: 'services',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            { $unwind: { path: '$rehearsal', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        ]).toArray();

        const formattedAttendance = attendanceRecords.map(a => {
            const eventDetails = a.rehearsal || a.service;
            
            return {
                id: a._id.toHexString(),
                status: a.status,
                user: {
                    firstName: a.user.firstName,
                    lastName: a.user.lastName,
                },
                event: {
                    title: eventDetails?.title ?? 'Deleted Event',
                    date: eventDetails?.date ?? a.createdAt,
                }
            }
        });

        return NextResponse.json(formattedAttendance);
    } catch (error) {
        console.error('Error fetching attendance for secretary:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export { GET };
