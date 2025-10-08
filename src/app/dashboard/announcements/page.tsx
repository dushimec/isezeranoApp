'use client';

import * as React from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SingerAnnouncementsPage from '@/app/singer/announcements/page';
import { t } from '@/utils/i18n';

export default function AnnouncementsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const fetchAnnouncements = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch announcements.');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  React.useEffect(() => {
    if (token) {
      fetchAnnouncements();
    }
  }, [token, fetchAnnouncements]);

  const handleCreateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create announcement');
      }
      toast({ title: 'Success', description: 'Announcement created successfully.' });
      fetchAnnouncements();
      setIsFormOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  if (user?.role === 'SINGER') {
    return <SingerAnnouncementsPage />;
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">{t('announcementsPage.title')}</h1>
          <p className="text-muted-foreground">
            {t('announcementsPage.createDescription')}
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {t('announcementsPage.createTitle')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('announcementsPage.newAnnouncement')}</DialogTitle>
              <DialogDescription>
                {t('announcementsPage.newAnnouncementDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="title">{t('announcementsPage.form.title')}</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="message">{t('announcementsPage.form.message')}</Label>
                <Textarea id="message" name="message" required />
              </div>
              <div>
                <Label htmlFor="priority">{t('announcementsPage.form.priority')}</Label>
                <Select name="priority" defaultValue="MEDIUM">
                  <SelectTrigger>
                    <SelectValue placeholder={t('announcementsPage.form.selectPriority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('announcementsPage.priority.LOW')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('announcementsPage.priority.MEDIUM')}</SelectItem>
                    <SelectItem value="HIGH">{t('announcementsPage.priority.HIGH')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="submit">{t('announcementsPage.form.publish')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('announcementsPage.manageTitle')}</CardTitle>
          <CardDescription>
            {t('announcementsPage.manageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('announcementsPage.table.title')}</TableHead>
                <TableHead>{t('announcementsPage.table.priority')}</TableHead>
                <TableHead>{t('announcementsPage.table.author')}</TableHead>
                <TableHead>{t('announcementsPage.table.createdAt')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('announcementsPage.table.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center">{t('loading')}</TableCell></TableRow>}
              {!isLoading && announcements.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">{t('announcementsPage.noAnnouncements')}</TableCell></TableRow>}
              {announcements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="font-medium">{ann.title}</TableCell>
                  <TableCell>
                    <Badge variant={ann.priority === 'HIGH' ? 'destructive' : ann.priority === 'LOW' ? 'outline' : 'secondary'}>
                      {ann.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{`${ann.createdBy.firstName} ${ann.createdBy.lastName}`}</TableCell>
                  <TableCell>
                    {format(new Date(ann.createdAt), 'MMMM d, yyyy')}
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
                          <span className="sr-only">{t('userTable.openMenu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('userTable.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem>{t('userTable.edit')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">{t('userTable.delete')}</DropdownMenuItem>
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
