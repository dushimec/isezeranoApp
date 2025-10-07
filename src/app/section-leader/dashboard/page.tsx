
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
import { fetchMembers } from "@/store/sectionLeaderSlice";
import { useAuth } from "@/auth/auth-provider";

function SectionLeaderDashboard() {
  const dispatch: AppDispatch = useDispatch();
  const { token } = useAuth();
  const { members, loading, error } = useSelector((state: RootState) => state.sectionLeader);

  useEffect(() => {
    if (token) {
      dispatch(fetchMembers(token));
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Section Leader Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard. Here you can manage your section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading === 'pending' && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {loading === 'succeeded' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Section Members</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <li key={member.id} className="p-4 border rounded-lg">
                    <p className="font-bold">{member.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(SectionLeaderDashboard, USER_ROLES.SECTION_LEADER);
