
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import withRole from "@/auth/with-role";
import { USER_ROLES } from "@/lib/user-roles";
import { AppDispatch, RootState } from "@/store";
import { fetchAnnouncements } from "@/store/announcementsSlice";
import { fetchRehearsals } from "@/store/rehearsalsSlice";
import { fetchServices } from "@/store/servicesSlice";
import { fetchAttendance } from "@/store/attendanceSlice";
import { useAuth } from "@/auth/auth-provider";

function ChoirMemberDashboard() {
  const dispatch: AppDispatch = useDispatch();
  const { token, user } = useAuth();
  const { announcements, loading: announcementsLoading, error: announcementsError } = useSelector((state: RootState) => state.announcements);
  const { rehearsals, loading: rehearsalsLoading, error: rehearsalsError } = useSelector((state: RootState) => state.rehearsals);
  const { services, loading: servicesLoading, error: servicesError } = useSelector((state: RootState) => state.services);
  const { attendance, loading: attendanceLoading, error: attendanceError } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    if (token && user) {
      dispatch(fetchAnnouncements(token));
      dispatch(fetchRehearsals(token));
      dispatch(fetchServices(token));
      dispatch(fetchAttendance({ userId: user.userId, token }));
    }
  }, [dispatch, token, user]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-4xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Choir Member Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Announcements</h2>
            {announcementsLoading === 'pending' && <p>Loading...</p>}
            {announcementsError && <p className="text-red-500">{announcementsError}</p>}
            {announcementsLoading === 'succeeded' && announcements.map(announcement => (
              <div key={announcement.id} className="p-4 border rounded-lg mb-4">
                <h3 className="font-bold">{announcement.title}</h3>
                <p>{announcement.content}</p>
                <p className="text-sm text-gray-500">{new Date(announcement.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Attendance</h2>
            {attendanceLoading === 'pending' && <p>Loading...</p>}
            {attendanceError && <p className="text-red-500">{attendanceError}</p>}
            {attendanceLoading === 'succeeded' && attendance.map(record => (
              <div key={record.id} className="p-4 border rounded-lg mb-4">
                 <p><b>{record.event_type}</b> on {new Date(record.event_date).toLocaleDateString()}: {record.status}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Rehearsals</h2>
            {rehearsalsLoading === 'pending' && <p>Loading...</p>}
            {rehearsalsError && <p className="text-red-500">{rehearsalsError}</p>}
            {rehearsalsLoading === 'succeeded' && rehearsals.map(rehearsal => (
              <div key={rehearsal.id} className="p-4 border rounded-lg mb-4">
                <p><b>{new Date(rehearsal.date).toLocaleDateString()}</b>: {rehearsal.startTime} - {rehearsal.endTime}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Services</h2>
            {servicesLoading === 'pending' && <p>Loading...</p>}
            {servicesError && <p className="text-red-500">{servicesError}</p>}
            {servicesLoading === 'succeeded' && services.map(service => (
              <div key={service.id} className="p-4 border rounded-lg mb-4">
                <p><b>{new Date(service.date).toLocaleDateString()}</b>: {service.startTime} - {service.endTime}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(ChoirMemberDashboard, USER_ROLES.CHOIR_MEMBER);
