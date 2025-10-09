'use client';

import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Users, Megaphone, CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Announcement } from '@/lib/types';
import { t } from "@/utils/i18n";
import Link from 'next/link';

// Define a unified event type for the dashboard
type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'REHEARSAL' | 'SERVICE';
};

type DashboardData = {
    totalUsers?: number;
    userCounts?: Record<Role, number>;
    upcomingEvents?: DashboardEvent[];
    recentAnnouncements?: Announcement[];
    attendanceSummary?: {status: string, _count: { status: number }}[];
    notifications?: any[];
    totalSingers?: number;
    sectionName?: string;
    memberCount?: number;
}


const AdminDashboard = ({ data }: { data: DashboardData }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("dashboardPage.admin.totalUsers")}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.totalUsers || 0}</div>
        <p className="text-xs text-muted-foreground">{t("dashboardPage.admin.totalUsersDesc")}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("dashboardPage.admin.singers")}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.userCounts?.SINGER || 0}</div>
        <p className="text-xs text-muted-foreground">{t("dashboardPage.admin.singersDesc")}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("dashboardPage.admin.upcomingEvents")}</CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</div>
        <p className="text-xs text-muted-foreground">{t("dashboardPage.admin.upcomingEventsDesc")}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("dashboardPage.admin.recentAnnouncements")}</CardTitle>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.recentAnnouncements?.length || 0}</div>
        <p className="text-xs text-muted-foreground">{t("dashboardPage.admin.recentAnnouncementsDesc")}</p>
      </CardContent>
    </Card>
  </div>
);

const SecretaryDashboard = ({ data }: { data: DashboardData }) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.secretary.upcomingEvents')}</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.secretary.upcomingEventsDesc')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.secretary.presentMembers')}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.attendanceSummary?.find(s => s.status === 'PRESENT')?._count.status || 0}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.secretary.presentMembersDesc')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.secretary.announcements')}</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.recentAnnouncements?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.secretary.announcementsDesc')}</p>
                </CardContent>
            </Card>
             <Link href="/dashboard/users">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboardPage.secretary.manageSingers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalSingers || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboardPage.secretary.manageSingersDesc')}</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}

const DisciplinarianDashboard = ({ data }: { data: DashboardData }) => {
    const present = data.attendanceSummary?.find(s => s.status === 'PRESENT')?._count.status || 0;
    const late = data.attendanceSummary?.find(s => s.status === 'LATE')?._count.status || 0;
    const absent = data.attendanceSummary?.find(s => s.status === 'ABSENT')?._count.status || 0;
    const total = present + late + absent;
    const avgAttendance = total > 0 ? ((present + late) / total) * 100 : 0;

    return (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.disciplinarian.avgAttendance')}</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgAttendance.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.disciplinarian.avgAttendanceDesc')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.disciplinarian.totalPresent')}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{present}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.disciplinarian.totalPresentDesc')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.disciplinarian.totalLate')}</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{late}</div>
                     <p className="text-xs text-muted-foreground">{t('dashboardPage.disciplinarian.totalLateDesc')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboardPage.disciplinarian.totalAbsent')}</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{absent}</div>
                     <p className="text-xs text-muted-foreground">{t('dashboardPage.disciplinarian.totalAbsentDesc')}</p>
                </CardContent>
            </Card>
        </div>
    )
}

const SectionLeaderDashboard = ({ data }: { data: DashboardData }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboardPage.sectionLeader.section')}: {data.sectionName}</CardTitle>
                <CardDescription>{t('dashboardPage.sectionLeader.sectionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.memberCount || 0}</div>
                <p className="text-xs text-muted-foreground">{t('dashboardPage.sectionLeader.membersDesc')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboardPage.sectionLeader.upcomingEvents')}</CardTitle>
                <CardDescription>{t('dashboardPage.sectionLeader.upcomingEventsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboardPage.sectionLeader.recentAnnouncements')}</CardTitle>
                <CardDescription>{t('dashboardPage.sectionLeader.recentAnnouncementsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.recentAnnouncements?.length || 0}</div>
            </CardContent>
        </Card>
    </div>
);

const SingerDashboard = ({ data }: { data: DashboardData }) => {
    const nextEvent = data.upcomingEvents?.[0];
    const latestAnnouncement = data.recentAnnouncements?.[0];
    const present = data.attendanceSummary?.find(s => s.status === 'PRESENT')?._count.status || 0;
    const late = data.attendanceSummary?.find(s => s.status === 'LATE')?._count.status || 0;
    const absent = data.attendanceSummary?.find(s => s.status === 'ABSENT')?._count.status || 0;
    const total = present + late + absent;
    const attendancePercentage = total > 0 ? ((present + late) / total) * 100 : 0;
    
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardPage.singer.nextEvent')}</CardTitle>
                     <CardDescription>
                        {nextEvent ? t('dashboardPage.singer.nextEventDesc', { type: nextEvent.type === 'REHEARSAL' ? 'Rehearsal' : 'Service', date: format(new Date(nextEvent.date), 'MMMM d') }) : t('dashboardPage.singer.noUpcomingEvents')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold">{nextEvent?.title}</p>
                    <p className="text-muted-foreground">{nextEvent ? `${format(new Date(nextEvent.date), 'p')} at ${nextEvent.location}` : t('dashboardPage.singer.checkBackLater')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardPage.singer.latestAnnouncement')}</CardTitle>
                     <CardDescription>
                        {latestAnnouncement ? t('dashboardPage.singer.latestAnnouncementDesc', { date: format(new Date(latestAnnouncement.createdAt), 'MMMM d') }) : t('dashboardPage.singer.noNewAnnouncements')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{latestAnnouncement?.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{latestAnnouncement?.message}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardPage.singer.yourAttendance')}</CardTitle>
                    <CardDescription>{t('dashboardPage.singer.yourAttendanceDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendancePercentage.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">{t('dashboardPage.singer.attendanceStats', { present, late, absent })}</p>
                </CardContent>
            </Card>
        </div>
    )
}

const API_PATHS: Record<Role, string> = {
    'ADMIN': '/api/admin/dashboard',
    'SECRETARY': '/api/secretary/dashboard',
    'DISCIPLINARIAN': '/api/disciplinarian/dashboard',
    'SECTION_LEADER': '/api/section-leader/dashboard',
    'SINGER': '/api/singer/dashboard',
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState<DashboardData>({});
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
        setDataLoading(true);
        try {
            const apiPath = API_PATHS[user.role];
            if (!apiPath) {
                throw new Error('Invalid user role for dashboard.');
            }
            const response = await fetch(apiPath,
             {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch dashboard data');
            }
            const dashboardData = await response.json();
            setData(dashboardData);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
        } finally {
            setDataLoading(false);
        }
    };
    fetchData();
  }, [user, token, toast]);

  const renderDashboard = () => {
    if(!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard data={data} />;
      case 'SECRETARY':
        return <SecretaryDashboard data={data} />;
      case 'DISCIPLINARIAN':
        return <DisciplinarianDashboard data={data} />;
      case 'SECTION_LEADER':
        return <SectionLeaderDashboard data={data} />;
      case 'SINGER':
        return <SingerDashboard data={data} />;
      default:
        return <p>{t('dashboardPage.default')}</p>;
    }
  };

  if(loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">{t("dashboardPage.loading")}</div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-headline">{t("dashboardPage.title")}</h1>
            <p className="text-muted-foreground">
                {t("dashboardPage.welcome").replace("{name}", user?.firstName || "")}
            </p>
        </div>
        {renderDashboard()}
    </div>
  );
}
