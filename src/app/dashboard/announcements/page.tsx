
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';

// Assuming an Announcement type
interface Announcement {
  id: string;
  title: string;
  author: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date; // Firestore timestamp or Date object
}

export default function AnnouncementsPage() {
  const { userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const announcementsCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'announcements') : null),
    [firestore]
  );
  
  const {
    data: announcements,
    isLoading,
    error,
  } = useCollection<Announcement>(announcementsCollectionRef);

  const handleCreateAnnouncement = () => {
    if (!firestore || !userProfile) return;
    
    // Example announcement data
    const newAnnouncement = {
        title: 'New Announcement',
        message: 'This is a test announcement.',
        createdBy: userProfile.id,
        createdAt: new Date(),
        priority: 'Normal',
    };
    
    addDocumentNonBlocking(collection(firestore, 'announcements'), newAnnouncement);
    
    toast({
      title: 'Creating Announcement',
      description: 'Submitting the new announcement...',
    });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'announcements', id));
    toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been removed.',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for all singers.
          </p>
        </div>
        <Button onClick={handleCreateAnnouncement}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
          <CardDescription>
            View, edit, or delete existing announcements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}
              {error && <TableRow><TableCell colSpan={5} className="text-destructive">{error.message}</TableCell></TableRow>}
              {announcements?.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="font-medium">{ann.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Published</Badge>
                  </TableCell>
                  <TableCell>{ann.author || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(ann.createdAt.seconds ? ann.createdAt.seconds * 1000 : ann.createdAt), 'MMMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(ann.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
