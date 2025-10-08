
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserRegistrationForm } from '@/app/dashboard/users/user-registration-form';
import { UserTable } from '@/app/dashboard/users/user-table';
import EventsView from './events-view';
import AnnouncementsView from './announcements-view';
import AttendanceView from './attendance-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const { token, user, loading } = useAuth();

  const fetchUsers = async () => {
    if (token) {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleUserCreated = () => {
    setIsCreateUserDialogOpen(false);
    fetchUsers();
  };

  const handleEditUser = (id: string, data: Partial<User>) => {
    console.log('Editing user:', id, data);
  };

  const handleDeleteUser = (user: User) => {
    console.log('Deleting user:', user);
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in to view this page.</div>
  }

  return (
    <div className="container mx-auto py-10">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New User</DialogTitle>
            </DialogHeader>
            <UserRegistrationForm onUserCreated={handleUserCreated} />
          </DialogContent>
        </Dialog>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="p-4 bg-card rounded-lg shadow-md">
            <UserTable users={users} currentUser={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
          </div>
        </TabsContent>
        <TabsContent value="events">
          <EventsView />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsView />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
