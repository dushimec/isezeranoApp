
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES } from "@/lib/user-roles";

interface UserTableProps {
  users: User[];
  currentUser?: User | null;
  onEdit: (user: User, newRole: User['role']) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, currentUser, onEdit, onDelete }: UserTableProps) {
  const [editingRole, setEditingRole] = React.useState<{ [userId: string]: User['role'] }>({});

  const handleRoleChange = (userId: string, role: User['role']) => {
    setEditingRole(prev => ({ ...prev, [userId]: role }));
  };

  const handleRoleSave = (user: User) => {
    const newRole = editingRole[user.id];
    if (newRole && newRole !== user.role) {
      onEdit(user, newRole);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Image
                        src={user.profileImageUrl || `https://picsum.photos/seed/${user.id}/40/40`}
                        width={40}
                        height={40}
                        alt={user.fullName}
                        className="rounded-full"
                        data-ai-hint="person portrait"
                    />
                    <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
                 <Badge variant={user.isActive ? 'default' : 'outline'} className={user.isActive ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>
                    {user.isActive ? "Active" : "Inactive"}
                </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.id === currentUser?.id}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Edit className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuRadioGroup value={editingRole[user.id] || user.role} onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}>
                                {Object.values(USER_ROLES).map(role => (
                                    <DropdownMenuRadioItem key={role} value={role}>{role}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRoleSave(user)}>
                                Save Changes
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(user)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
