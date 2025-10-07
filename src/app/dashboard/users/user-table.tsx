
'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUsers, updateUser, deleteUser } from '@/store/usersSlice';
import { User, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function UserTable() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);
  const { token } = useAppSelector((state) => state.auth);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchUsers(token));
    }
  }, [dispatch, token]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (token) {
      dispatch(deleteUser({ id, token }));
    }
  };

  const handleUpdateUser = () => {
    if (selectedUser && token) {
        dispatch(updateUser({ user: selectedUser, token }));
        setIsEditDialogOpen(false);
        setSelectedUser(null);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {users.map((user) => (
                <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(user.id)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                    <div className="space-y-4 py-4">
                        <Input 
                            defaultValue={selectedUser.firstName}
                            onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                            placeholder="First Name"
                        />
                         <Input 
                            defaultValue={selectedUser.lastName}
                            onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                            placeholder="Last Name"
                        />
                        <Input 
                            defaultValue={selectedUser.email}
                            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                            placeholder="Email"
                        />
                        <Input 
                            defaultValue={selectedUser.username}
                            onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                            placeholder="Username"
                        />
                       <Select 
                            defaultValue={selectedUser.role} 
                            onValueChange={(value) => setSelectedUser({...selectedUser, role: value as Role})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                            {Object.values(Role).map((role) => (
                                <SelectItem key={role} value={role}>
                                {role}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="user-status"
                                checked={selectedUser.isActive}
                                onCheckedChange={(checked) => setSelectedUser({...selectedUser, isActive: checked})}
                            />
                            <label htmlFor="user-status">Active</label>
                        </div>

                        <Button onClick={handleUpdateUser}>Save Changes</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </>
  );
}
