
'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAnnouncements } from '@/store/announcementsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AnnouncementsView() {
  const dispatch = useAppDispatch();
  const { announcements, loading } = useAppSelector((state) => state.announcements);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchAnnouncements(token));
    }
  }, [dispatch, token]);

  if (loading) return <div>Loading announcements...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {announcements.map((announcement) => (
            <AccordionItem key={announcement.id} value={announcement.id}>
              <AccordionTrigger>{announcement.title}</AccordionTrigger>
              <AccordionContent>
                <p>{announcement.content}</p>
                <p className="text-sm text-muted-foreground mt-2">{new Date(announcement.createdAt).toLocaleString()}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
