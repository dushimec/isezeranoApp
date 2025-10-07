
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextApiRequest } from 'next';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TUser } from '@/lib/types';

async function getAdminDashboardData() {
    const totalUsers = await prisma.user.count();
    const userCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            role: true,
        },
    });
    const upcomingEvents = await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
        },
        orderBy: {
            date: 'asc',
        },
        take: 5,
    });
    const recentAnnouncements = await prisma.announcement.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 5,
    });

    return {
        totalUsers,
        userCounts: userCounts.reduce((acc, curr) => {
            acc[curr.role] = curr._count.role;
            return acc;
        }, {} as Record<Role, number>),
        upcomingEvents,
        recentAnnouncements,
    };
}

async function getSecretaryDashboardData() {
    const upcomingEvents = await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
    const attendanceSummary = await prisma.attendance.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });
    const recentAnnouncements = await prisma.announcement.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 5,
    });

    return {
        upcomingEvents,
        attendanceSummary: attendanceSummary.map(s => ({ status: s.status, count: s._count.status })),
        recentAnnouncements,
    };
}

async function getDisciplinarianDashboardData() {
    const attendanceSummary = await prisma.attendance.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });

    return {
        attendanceSummary: attendanceSummary.map(s => ({ status: s.status, count: s._count.status })),
    };
}

async function getSingerDashboardData(userId: string) {
    const upcomingEvents = await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
        },
        orderBy: {
            date: 'asc',
        },
        take: 1,
    });

    const announcements = await prisma.announcement.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 1,
    });

    const attendanceSummary = await prisma.attendance.groupBy({
        where: {
            userId: userId,
        },
        by: ['status'],
        _count: {
            status: true,
        },
    });

    return {
        upcomingEvents,
        announcements,
        attendanceSummary: attendanceSummary.map(s => ({ status: s.status, count: s._count.status })),
    };
}

export async function GET(req: NextApiRequest, { params }: { params: { role: Role } }) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = params;
    const user = token.user as TUser;

    try {
        let data;
        switch (role) {
            case Role.ADMIN:
                data = await getAdminDashboardData();
                break;
            case Role.SECRETARY:
                data = await getSecretaryDashboardData();
                break;
            case Role.DISCIPLINARIAN:
                data = await getDisciplinarianDashboardData();
                break;
            case Role.SINGER:
                data = await getSingerDashboardData(user.id);
                break;
            default:
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching ${role} dashboard data:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
