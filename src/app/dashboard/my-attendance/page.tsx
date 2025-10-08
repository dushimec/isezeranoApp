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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AttendanceStatus } from '@/lib/types';
import { t } from "@/utils/i18n";

type AttendanceRecord = {
  id: string;
  status: AttendanceStatus;
  event: {
    title: string;
    date: string;
  };
};

export default function MyAttendancePage() {
  const { token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchAttendance = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/singer/attendance', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch attendance records.');
          }

          const data = await response.json();
          setAttendance(data);
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
          setLoading(false);
        }
      };
      fetchAttendance();
    }
  }, [token, toast]);

  const getBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'default';
      case 'LATE':
        return 'secondary';
      case 'ABSENT':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading || authLoading) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">{t("myAttendancePage.loading")}</div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">{t("myAttendancePage.title")}</h1>
        <p className="text-muted-foreground">
          {t("myAttendancePage.description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("myAttendancePage.historyTitle")}</CardTitle>
          <CardDescription>
            {t("myAttendancePage.historyDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("myAttendancePage.event")}</TableHead>
                <TableHead>{t("myAttendancePage.date")}</TableHead>
                <TableHead className="text-right">{t("myAttendancePage.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {t("myAttendancePage.noRecords")}
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.event.title}</TableCell>
                    <TableCell>{format(new Date(record.event.date), 'MMMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getBadgeVariant(record.status)}>
                        {t(`myAttendancePage.${record.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
