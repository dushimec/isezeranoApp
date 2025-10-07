
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
import { USER_ROLES } from '@/lib/user-roles';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';

export default function UsersPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useCollection<User>(usersCollectionRef);

  React.useEffect(() => {
    if (!loading && (!user || userProfile?.role !== USER_ROLES.ADMIN)) {
      router.push('/unauthorized');
    }
  }, [user, userProfile, loading, router]);

  const handleEditUser = async (userToUpdate: User, newRole: User['role']) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userToUpdate.id);
    try {
      await updateDoc(userDocRef, { role: newRole });
      toast({
        title: 'User Updated',
        description: `Role for ${userToUpdate.firstName} ${userToUpdate.lastName} updated to ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userToDelete.id);
    try {
      await deleteDoc(userDocRef);
      toast({
        title: 'User Deleted',
        description: `${userToDelete.firstName} ${userToDelete.lastName} has been removed from the system.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  if (loading || usersLoading) {
    return <p>Loading...</p>;
  }
  
  if (!user || userProfile?.role !== USER_ROLES.ADMIN) {
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
                This form is for creating Firestore user profiles. Firebase Auth user creation is handled separately for security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRegistrationForm />
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
              {usersError && <p className="text-destructive">{usersError.message}</p>}
              {users && (
                <UserTable
                  users={users}
                  currentUser={userProfile}
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
