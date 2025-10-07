
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
}


const AdminDashboard = ({ data }: { data: DashboardData }) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">All roles included</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Singers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.userCounts?.SINGER || 0}</div>
                    <p className="text-xs text-muted-foreground">Total active singers</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">In the next 30 days</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.recentAnnouncements?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Published recently</p>
                </CardContent>
            </Card>
        </div>
    );
}

const SecretaryDashboard = ({ data }: { data: DashboardData }) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Rehearsals & Services</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Members (Total)</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.attendanceSummary?.find(s => s.status === 'PRESENT')?._count.status || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all events</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.recentAnnouncements?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Recently published</p>
                </CardContent>
            </Card>
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
                    <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgAttendance.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">Across all events</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{present}</div>
                    <p className="text-xs text-muted-foreground">In all recorded events</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Late</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{late}</div>
                     <p className="text-xs text-muted-foreground">In all recorded events</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{absent}</div>
                     <p className="text-xs text-muted-foreground">In all recorded events</p>
                </CardContent>
            </Card>
        </div>
    )
}

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
                    <CardTitle>Next Event</CardTitle>
                     <CardDescription>
                        {nextEvent ? `${nextEvent.type === 'REHEARSAL' ? 'Rehearsal' : 'Service'} on ${format(new Date(nextEvent.date), 'MMMM d')}` : 'No upcoming events'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold">{nextEvent?.title}</p>
                    <p className="text-muted-foreground">{nextEvent ? `${format(new Date(nextEvent.date), 'p')} at ${nextEvent.location}` : 'Check back later'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Latest Announcement</CardTitle>
                     <CardDescription>
                        {latestAnnouncement ? `from ${format(new Date(latestAnnouncement.createdAt), 'MMMM d')}` : 'No new announcements'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{latestAnnouncement?.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{latestAnnouncement?.message}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Your Attendance</CardTitle>
                    <CardDescription>Your overall participation rate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendancePercentage.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">{present} Present, {late} Late, {absent} Absent</p>
                </CardContent>
            </Card>
        </div>
    )
}

const API_PATHS: Record<Role, string> = {
    'ADMIN': '/api/admin/dashboard',
    'SECRETARY': '/api/secretary/dashboard',
    'DISCIPLINARIAN': '/api/disciplinarian/dashboard',
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
      case 'SINGER':
        return <SingerDashboard data={data} />;
      default:
        return <p>Welcome to your dashboard.</p>;
    }
  };

  if(loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">Loading...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-headline">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back, {user?.firstName}! Here's your overview.
            </p>
        </div>
        {renderDashboard()}
    </div>
  );
}
