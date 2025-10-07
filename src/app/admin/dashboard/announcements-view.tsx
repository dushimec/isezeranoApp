
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Announcement } from '@/lib/types';
import { format } from 'date-fns';

export default function AnnouncementsView() {
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

  if (loading) return <div>Loading announcements...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-muted-foreground">No announcements found.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {announcements.map((announcement) => (
              <AccordionItem key={announcement.id} value={announcement.id}>
                <AccordionTrigger>{announcement.title}</AccordionTrigger>
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
  );
}
