
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { Role, User } from '@/lib/types';

type TUser = User;

enum RoleEnum {
    ADMIN = "ADMIN",
    SECRETARY = "SECRETARY",
    DISCIPLINARIAN = "DISCIPLINARIAN",
    SINGER = "SINGER",
}

async function getAdminDashboardData() {
    // TODO: Implement MongoDB queries
    console.log("Fetching admin dashboard data...");
    return {
        totalUsers: 0,
        userCounts: {},
        upcomingEvents: [],
        recentAnnouncements: [],
    };
}

async function getSecretaryDashboardData() {
    // TODO: Implement MongoDB queries
    console.log("Fetching secretary dashboard data...");
    return {
        upcomingEvents: [],
        attendanceSummary: [],
        recentAnnouncements: [],
    };
}

async function getDisciplinarianDashboardData() {
    // TODO: Implement MongoDB queries
    console.log("Fetching disciplinarian dashboard data...");
    return {
        attendanceSummary: [],
    };
}

async function getSingerDashboardData(userId: string) {
    // TODO: Implement MongoDB queries
    console.log(`Fetching singer dashboard data for user ${userId}...`);
    return {
        upcomingEvents: [],
        announcements: [],
        attendanceSummary: [],
    };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ role: string }> }) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await params;
    const user = token.user as TUser | undefined;

    try {
        let data;
        switch (role) {
            case RoleEnum.ADMIN:
                data = await getAdminDashboardData();
                break;
            case RoleEnum.SECRETARY:
                data = await getSecretaryDashboardData();
                break;
            case RoleEnum.DISCIPLINARIAN:
                data = await getDisciplinarianDashboardData();
                break;
            case RoleEnum.SINGER:
                if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
