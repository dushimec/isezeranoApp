
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Event, Attendance } from '@/lib/types';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const chartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
};

type MonthlyAttendance = {
  name: string;
  attendance: number;
};

type ReportPeriod = 'this-month' | 'last-3-months' | 'last-6-months' | 'this-year';

export default function ReportsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('this-month');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const apiPrefix = user.role === 'ADMIN' ? '/api/admin' : '/api/secretary';

        const [usersRes, eventsRes, attendanceRes] = await Promise.all([
          fetch(`${apiPrefix}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiPrefix}/events`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiPrefix}/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!usersRes.ok || !eventsRes.ok || !attendanceRes.ok) {
          throw new Error('Failed to fetch report data.');
        }

        const usersData = await usersRes.json();
        const eventsData = await eventsRes.json();
        const attendanceData = await attendanceRes.json();

        setUsers(usersData);
        setEvents(eventsData);
        setAttendance(attendanceData);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, toast]);
  
  const handleDownloadReport = async () => {
    if (!token) return;
    setIsDownloading(true);
    try {
        const response = await fetch(`/api/admin/reports/attendance?period=${reportPeriod}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to download report.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${reportPeriod}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        toast({ title: 'Success', description: 'Report downloaded successfully.' });

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Download Failed', description: error.message });
    } finally {
        setIsDownloading(false);
    }
  };


  const totalUsers = users.length;
  const singers = users.filter((u) => u.role === 'SINGER').length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

  const presentRecords = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const averageAttendance = attendance.length > 0 ? (presentRecords / attendance.length) * 100 : 0;
  
  const processAttendanceData = (): MonthlyAttendance[] => {
    const now = new Date();
    const monthlyData: { [key: string]: { total: number; present: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = `${getYear(date)}-${getMonth(date)}`;
      monthlyData[monthKey] = { total: 0, present: 0 };
    }

    attendance.forEach(record => {
      // Ensure record.event.date is valid before creating a Date object
      if (record?.event?.date) {
          const recordDate = new Date(record.event.date);
          const monthKey = `${getYear(recordDate)}-${getMonth(recordDate)}`;

          if (monthlyData[monthKey]) {
              monthlyData[monthKey].total++;
              if (record.status === 'PRESENT' || record.status === 'LATE') {
                  monthlyData[monthKey].present++;
              }
          }
      }
    });

    return Object.entries(monthlyData).map(([key, value]) => {
      const [year, month] = key.split('-');
      const monthName = format(new Date(Number(year), Number(month)), 'MMM');
      const percentage = value.total > 0 ? (value.present / value.total) * 100 : 0;
      return {
        name: monthName,
        attendance: Math.round(percentage),
      };
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">Loading...</div></div>;
  }
  
  const attendanceChartData = processAttendanceData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">Reports</h1>
        <p className="text-muted-foreground">
          View reports on attendance, participation, and user activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{singers} singers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all recorded events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Rehearsals & Services</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
                Monthly attendance percentage for the last 6 months.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={attendanceChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <YAxis
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="attendance" fill="var(--color-attendance)" radius={8} />
                </BarChart>
            </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>
                    Download a detailed attendance report for a specific period.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                 <div>
                    <label htmlFor="report-period" className="text-sm font-medium">Select Period</label>
                    <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportPeriod)}>
                        <SelectTrigger id="report-period">
                            <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                            <SelectItem value="this-year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <Button onClick={handleDownloadReport} disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Generating...' : 'Download Excel Report'}
                 </Button>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
