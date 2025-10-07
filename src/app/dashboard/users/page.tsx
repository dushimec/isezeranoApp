
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserRegistrationForm } from './user-registration-form';
import { UserTable } from './user-table';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Role, User } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [usersError, setUsersError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setUsersError(null);
    } catch (error: any) {
      setUsersError(error.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUsersLoading(false);
    }
  }, [token, toast]);

  React.useEffect(() => {
    if (!loading) {
      if (!user || user.role !== Role.ADMIN) {
        router.push('/unauthorized');
      } else {
        fetchUsers();
      }
    }
  }, [user, loading, router, fetchUsers]);

  const handleUserCreated = () => {
    fetchUsers(); // Refetch users after one is created
  };
  
  const handleEditUser = async (userId: string, data: Partial<User>) => {
     if (!token) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'No auth token found.' });
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      toast({
        title: 'User Updated',
        description: 'User details have been successfully updated.',
      });
      fetchUsers();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
     if (!token) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'No auth token found.' });
      return;
    }
     try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      toast({
        title: 'User Deleted',
        description: `${userToDelete.firstName} ${userToDelete.lastName} has been removed.`,
      });
      fetchUsers();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message,
      });
    }
  };

  if (loading || (!user && !usersLoading)) {
    return <div className="flex items-center justify-center min-h-screen"><div className="loader">Loading...</div></div>;
  }
  
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage users for the CMS.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Register New User</CardTitle>
              <CardDescription>
                Create a new user account and assign them a role. A temporary password will be set.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRegistrationForm onUserCreated={handleUserCreated} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Users</CardTitle>
              <CardDescription>
                View, edit, or delete existing users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersError && <p className="text-destructive">{usersError}</p>}
              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                <UserTable
                  users={users}
                  currentUser={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
