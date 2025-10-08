
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { t } from "@/utils/i18n";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const getPasswordSchema = (t: (key: string) => string) => z.object({
  newPassword: z.string().min(8, t('changePasswordPage.newPasswordLength')),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('changePasswordPage.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const passwordSchema = getPasswordSchema(t);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: values.newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('changePasswordPage.updateFailed'));
      }

      toast({
        title: t('changePasswordPage.success'),
        description: t('changePasswordPage.passwordUpdated'),
      });

      logout();
      router.push('/login');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('changePasswordPage.error'),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('changePasswordPage.title')}</CardTitle>
          <CardDescription>
            {t('changePasswordPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('changePasswordPage.newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('changePasswordPage.confirmNewPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('changePasswordPage.updating') : t('changePasswordPage.updatePassword')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
