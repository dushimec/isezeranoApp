
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
    // Note: This only deletes the Firestore record.
    // For a full user deletion, you'd also need to delete the user from Firebase Auth,
    // which requires admin privileges and is best handled via a backend function.
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
    return <div className="flex items-center justify-center min-h-screen"><div className="loader">Loading...</div></div>;
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
                Create a new user account and assign them a role. A temporary password will be set.
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
