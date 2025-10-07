
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserRegistrationForm from './user-registration-form';
import UserTable from '@/app/dashboard/users/user-table';
import EventsView from './events-view';
import AnnouncementsView from './announcements-view';
import AttendanceView from './attendance-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboardPage() {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = React.useState(false);

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
            <UserRegistrationForm onSuccess={() => setIsCreateUserDialogOpen(false)} />
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
            <UserTable />
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
