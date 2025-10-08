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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, Mail } from 'lucide-react';
import { Notification } from '@/lib/types';
import { t } from "@/utils/i18n";

export default function NotificationsPage() {
  const { token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast({ title: 'Success', description: 'Notification marked as read.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="loader">{t("notificationsPage.loading")}</div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">{t("notificationsPage.title")}</h1>
        <p className="text-muted-foreground">
          {t("notificationsPage.description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("notificationsPage.inboxTitle")}</CardTitle>
          <CardDescription>
            {t("notificationsPage.inboxDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("notificationsPage.message")}</TableHead>
                <TableHead>{t("notificationsPage.received")}</TableHead>
                <TableHead className="text-right">{t("notificationsPage.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    {t("notificationsPage.noNotifications")}
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className={cn(!notification.isRead && 'bg-accent/50')}
                  >
                    <TableCell>
                      <div className="font-medium">{notification.title}</div>
                      <div className={cn("text-sm", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                        {notification.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={notification.isRead}
                      >
                        {notification.isRead ? (
                          <><Check className="mr-2 h-4 w-4" /> {t("notificationsPage.read")}</>
                        ) : (
                          <><Mail className="mr-2 h-4 w-4" /> {t("notificationsPage.markAsRead")}</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
