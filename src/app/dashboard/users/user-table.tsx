'use client';

import React, { useState } from 'react';
import { User, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { t } from "@/utils/i18n";

interface UserTableProps {
    users: User[];
    currentUser: User;
    onEdit: (id: string, data: Partial<User>) => void;
    onDelete: (user: User) => void;
}


export function UserTable({ users, currentUser, onEdit, onDelete }: UserTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (selectedUser) {
        onEdit(selectedUser.id, selectedUser);
        setIsEditDialogOpen(false);
        setSelectedUser(null);
    }
  };

  const creatableRoles: Role[] = ['SECRETARY', 'DISCIPLINARIAN', 'SINGER'];


  return (
    <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("userTable.name")}</TableHead>
              <TableHead>{t("userTable.role")}</TableHead>
              <TableHead>{t("userTable.status")}</TableHead>
              <TableHead>
                <span className="sr-only">{t("userTable.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.profileImage || `https://picsum.photos/seed/${user.id}/40/40`}
                      width={40}
                      height={40}
                      alt={user.firstName}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">{user.email || user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? t("userTable.active") : t("userTable.inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.id !== currentUser.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("userTable.openMenu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("userTable.actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>{t("userTable.edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">{t("userTable.delete")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("userTable.editUser")}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    defaultValue={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    placeholder={t("userTable.firstName")}
                  />
                  <Input 
                    defaultValue={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    placeholder={t("userTable.lastName")}
                  />
                </div>
                <Input 
                  defaultValue={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  placeholder={t("userTable.email")}
                />
                <Input 
                  defaultValue={selectedUser.username || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                  placeholder={t("userTable.username")}
                />
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value as Role})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("userTable.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    {creatableRoles.map((role) => (
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
                  <label htmlFor="user-status">{selectedUser.isActive ? t("userTable.active") : t("userTable.inactive")}</label>
                </div>
                <Button onClick={handleUpdateUser} className="w-full">{t("userTable.saveChanges")}</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
}
