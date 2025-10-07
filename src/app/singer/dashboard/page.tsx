
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import withRole from "@/auth/with-role";
import { USER_ROLES } from "@/lib/user-roles";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchAnnouncements } from '@/store/announcementsSlice';
import { fetchAttendance } from '@/store/attendanceSlice';

function SingerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { announcements, loading: announcementsLoading, error: announcementsError } = useSelector((state: RootState) => state.announcements);
  const { attendance, loading: attendanceLoading, error: attendanceError } = useSelector((state: RootState) => state.attendance);
  const { token } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (token) {
      dispatch(fetchAnnouncements(token));
      dispatch(fetchAttendance(token));
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Singer Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Announcements</h2>
              {announcementsLoading === 'pending' && <p>Loading announcements...</p>}
              {announcementsError && <p>Error: {announcementsError}</p>}
              {announcementsLoading === 'succeeded' && (
                <ul>
                  {announcements.map((announcement) => (
                    <li key={announcement.id}>{announcement.message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Attendance</h2>
              {attendanceLoading === 'pending' && <p>Loading attendance...</p>}
              {attendanceError && <p>Error: {attendanceError}</p>}
              {attendanceLoading === 'succeeded' && (
                <ul>
                  {attendance.map((record) => (
                    <li key={record.id}>
                      {record.rehearsalId ? 'Rehearsal' : 'Service'} - {new Date(record.createdAt).toLocaleDateString()} - {record.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(SingerDashboard, USER_ROLES.SINGER);
