
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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Role, User } from "@prisma/client";

interface UserTableProps {
  users: User[];
  currentUser?: User | null;
  onEdit: (userId: string, data: Partial<User>) => void;
  onDelete: (user: User) => void;
}

const editableRoles = Object.values(Role).filter(r => r !== Role.ADMIN);


export function UserTable({ users, currentUser, onEdit, onDelete }: UserTableProps) {
  
  const handleRoleChange = (userId: string, newRole: Role) => {
    onEdit(userId, { role: newRole });
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
                        src={user.profileImage || `https://picsum.photos/seed/${user.id}/40/40`}
                        width={40}
                        height={40}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="rounded-full object-cover"
                        data-ai-hint="person portrait"
                    />
                    <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email || user.username}</p>
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
                  <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.id === currentUser?.id || user.role === Role.ADMIN}>
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
                             <DropdownMenuRadioGroup value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as Role)}>
                                {editableRoles.map(role => (
                                    <DropdownMenuRadioItem key={role} value={role}>{role}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
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
