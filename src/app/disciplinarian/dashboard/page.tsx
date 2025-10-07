
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
import { fetchAllAttendance, fetchAllUsers } from "@/store/disciplinarianSlice";
import { useAuth } from "@/auth/auth-provider";

function DisciplinarianDashboard() {
  const dispatch: AppDispatch = useDispatch();
  const { token } = useAuth();
  const { users, attendance, loading, error } = useSelector((state: RootState) => state.disciplinarian);

  useEffect(() => {
    if (token) {
      dispatch(fetchAllUsers(token));
      dispatch(fetchAllAttendance(token));
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-4xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Disciplinarian Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard. Here you can manage attendance and disciplinary records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading === 'pending' && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {loading === 'succeeded' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">All Users</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {users.map((user) => (
                  <li key={user.id} className="p-4 border rounded-lg">
                    <p className="font-bold">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </li>
                ))}
              </ul>
              <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{record.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.event_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(record.event_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(DisciplinarianDashboard, USER_ROLES.DISCIPLINARIAN);
