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
import { Role, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { t } from "@/utils/i18n";

export default function UsersPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [usersError, setUsersError] = React.useState<string | null>(null);

  const API_BASE_PATH = user?.role === 'ADMIN' ? '/api/admin/users' : '/api/secretary/users';
  const hasAccess = user?.role === 'ADMIN' || user?.role === 'SECRETARY';

  const fetchUsers = React.useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const response = await fetch(API_BASE_PATH, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(t("usersPage.error"));
      }
      const data = await response.json();
      setUsers(data);
      setUsersError(null);
    } catch (error: any) {
      setUsersError(error.message);
      toast({
        variant: 'destructive',
        title: t("usersPage.error"),
        description: error.message,
      });
    } finally {
      setUsersLoading(false);
    }
  }, [token, toast, API_BASE_PATH]);

  React.useEffect(() => {
    if (!loading) {
      if (!hasAccess) {
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
      toast({ variant: 'destructive', title: t("usersPage.authError"), description: t("usersPage.noToken") });
      return;
    }
    try {
      console.log('Sending PUT to', `${API_BASE_PATH}/${userId}`, 'payload:', data);
      const response = await fetch(`${API_BASE_PATH}/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("usersPage.updateFailed"));
      }
      toast({
        title: t("usersPage.userUpdated"),
        description: t("usersPage.userUpdatedDesc"),
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t("usersPage.updateFailed"),
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!token) {
      toast({ variant: 'destructive', title: t("usersPage.authError"), description: t("usersPage.noToken") });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_PATH}/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("usersPage.deletionFailed"));
      }
      toast({
        title: t("usersPage.userDeleted"),
        description: t("usersPage.userDeletedDesc").replace("{name}", `${userToDelete.firstName} ${userToDelete.lastName}`),
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t("usersPage.deletionFailed"),
        description: error.message,
      });
    }
  };

  if (loading || (!user && !usersLoading)) {
    return <div className="flex items-center justify-center min-h-screen"><div className="loader">{t("usersPage.loading")}</div></div>;
  }
  
  if (!user || !hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">{t("usersPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("usersPage.description")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("usersPage.registerTitle")}</CardTitle>
              <CardDescription>
                {t("usersPage.registerDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRegistrationForm onUserCreated={handleUserCreated} apiPath={API_BASE_PATH} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("usersPage.existingTitle")}</CardTitle>
              <CardDescription>
                {t("usersPage.existingDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersError && <p className="text-destructive">{usersError}</p>}
              {usersLoading ? (
                <p>{t("usersPage.loadingUsers")}</p>
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
