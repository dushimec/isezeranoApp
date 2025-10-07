
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
import { fetchSecretaryDashboard } from '@/store/secretarySlice';

function SecretaryDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardData, loading, error } = useSelector((state: RootState) => state.secretary);
  const { token } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (token) {
      dispatch(fetchSecretaryDashboard(token));
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Secretary Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading === 'pending' && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {dashboardData && (
            <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
          )}
          <p>You can manage announcements, schedules, and choir singer records here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(SecretaryDashboard, USER_ROLES.SECRETARY);
