
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Attendance } from '@/lib/types';
import { format } from 'date-fns';

export default function AttendanceView() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchAttendance = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/admin/attendance', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch attendance');
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

  if (loading) return <div>Loading attendance records...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
             {!loading && attendance.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No attendance records found.</TableCell></TableRow>}
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{`${record.user?.firstName || ''} ${record.user?.lastName || ''}`}</TableCell>
                <TableCell>{record.event?.title || ''}</TableCell>
                <TableCell>{record.event?.date ? format(new Date(record.event.date), 'PPP') : ''}</TableCell>
                <TableCell>
                    <Badge variant={record.status === 'PRESENT' ? 'default' : record.status === 'LATE' ? 'secondary' : 'destructive'}>
                        {record.status}
                    </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
