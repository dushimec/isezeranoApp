
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
import { UserRegistrationForm } from "./user-registration-form";
import { UserTable } from "./user-table";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUsers } from '@/store/adminSlice';
import { User } from "@/lib/types";

function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.admin);
  const { token } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (token) {
      dispatch(fetchUsers(token));
    }
  }, [dispatch, token]);


  const handleEditUser = (user: User) => {
    // TODO: Implement user editing logic
    console.log("Editing user:", user);
  };

  const handleDeleteUser = (user: User) => {
    // TODO: Implement user deletion logic
    console.log("Deleting user:", user);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Admin Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard. You can manage users, roles, and system settings here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Register New User</h2>
              <UserRegistrationForm />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              {loading === 'pending' && <p>Loading users...</p>}
              {error && <p>Error: {error}</p>}
              {loading === 'succeeded' && (
                <UserTable
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withRole(AdminDashboard, USER_ROLES.ADMIN);
