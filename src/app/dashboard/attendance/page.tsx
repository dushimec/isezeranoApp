
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

type TEvent = {
  id: string;
  title: string;
  date: string;
  type: 'REHEARSAL' | 'SERVICE';
};

type User = {
    id: string;
    fullName: string;
    profileImage: string | null;
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export default function AttendancePage() {
  const [events, setEvents] = useState<TEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, token } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/disciplinarian/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch events.' });
    }
  }, [token, toast]);

  const fetchUsers = useCallback(async () => {
     if (!token) return;
    try {
      const response = await fetch('/api/disciplinarian/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
      // Initialize attendance state
      const initialAttendance = data.reduce((acc: Record<string, AttendanceStatus>, user: User) => {
        acc[user.id] = 'PRESENT';
        return acc;
      }, {});
      setAttendance(initialAttendance);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
    }
  }, [token, toast]);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [fetchEvents, fetchUsers]);

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [userId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedEvent || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'No event selected or user not logged in.' });
        return;
    }
    setIsLoading(true);

    const attendanceData = Object.entries(attendance).map(([userId, status]) => ({ userId, status }));
    
    try {
      const response = await fetch('/api/disciplinarian/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          eventType: selectedEvent.type,
          attendanceData,
          markedById: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      toast({ title: 'Success', description: 'Attendance saved successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save attendance.' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Mark attendance for rehearsals and services.
          </p>
        </div>
        <Button onClick={handleSaveAttendance} disabled={isLoading || !selectedEvent}>
          {isLoading ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Select an event and mark each singer's status.
              </CardDescription>
            </div>
            <div className="w-full md:w-72">
               <Select 
                value={selectedEvent?.id} 
                onValueChange={(eventId) => setSelectedEvent(events.find(e => e.id === eventId) || null)}
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {format(new Date(event.date), 'MMM d, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Singer</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <Image
                        src={user.profileImage || `https://picsum.photos/seed/${user.id}/40/40`}
                        width={40}
                        height={40}
                        alt={user.fullName}
                        className="rounded-full object-cover"
                        data-ai-hint="person portrait"
                      />
                      <span className="font-medium">{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <RadioGroup 
                        defaultValue="PRESENT" 
                        className="flex justify-end gap-4"
                        value={attendance[user.id]}
                        onValueChange={(value) => handleStatusChange(user.id, value as AttendanceStatus)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PRESENT" id={`present-${user.id}`} />
                            <Label htmlFor={`present-${user.id}`}>Present</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LATE" id={`late-${user.id}`} />
                            <Label htmlFor={`late-${user.id}`}>Late</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ABSENT" id={`absent-${user.id}`} />
                            <Label htmlFor={`absent-${user.id}`}>Absent</Label>
                        </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
