'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function SingerAnnouncementsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchAnnouncements = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/admin/announcements', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch announcements');
          }
          const data = await response.json();
          setAnnouncements(data);
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncements();
    }
  }, [token, toast]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">Loading...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-headline">Announcements</h1>
            <p className="text-muted-foreground">
                View all choir announcements.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Announcements</CardTitle>
                <CardDescription>
                Here is a list of all past and present announcements.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {announcements.length === 0 ? (
                <p className="text-muted-foreground">No announcements found.</p>
                ) : (
                <Accordion type="single" collapsible className="w-full">
                    {announcements.map((announcement) => (
                    <AccordionItem key={announcement.id} value={announcement.id}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-4">
                                <span>{announcement.title}</span>
                                <Badge variant={announcement.priority === 'HIGH' ? 'destructive' : announcement.priority === 'LOW' ? 'outline' : 'secondary'}>
                                    {announcement.priority}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <p>{announcement.message}</p>
                        <div className="text-sm text-muted-foreground mt-2">
                            <p>By: {announcement.createdBy.firstName} {announcement.createdBy.lastName}</p>
                            <p>Created: {format(new Date(announcement.createdAt), 'PPP p')}</p>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
