
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { t } from "@/utils/i18n";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IsezeranoLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.object({
  identifier: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const usernameSchema = z.object({
  identifier: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [adminExists, setAdminExists] = React.useState<boolean | null>(null);
  const [loginType, setLoginType] = React.useState<"email" | "username">("email");

   const form = useForm({
    resolver: zodResolver(loginType === "email" ? emailSchema : usernameSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  
  React.useEffect(() => {
    if(user) {
        router.replace('/dashboard');
    }
  }, [user, router]);

  React.useEffect(() => {
    // Reset form when loginType changes
    form.reset();
  }, [loginType, form]);


  React.useEffect(() => {
    async function checkAdmin() {
        try {
            const response = await fetch('/api/auth/check-admin');
            const data = await response.json();
            setAdminExists(data.exists);
        } catch (error) {
            toast({ variant: "destructive", title: t('loginPage.error'), description: t('loginPage.verifying') });
        } finally {
            setIsLoading(false);
        }
    }
    checkAdmin();
  }, [toast]);


  async function onSubmit(values: z.infer<typeof emailSchema> | z.infer<typeof usernameSchema>) {
    setIsLoading(true);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, loginType }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || t('loginPage.loginFailed'));
        }
        
        login(data.token, data.user);

        toast({
            title: t('loginPage.loginSuccess'),
            description: t('loginPage.loginSuccessDesc', { name: data.user.firstName }),
        });
        router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('loginPage.loginFailed'),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (adminExists === null) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">{t('loginPage.verifying')}</div>
      </div>
    );
  }

  if (adminExists === false) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <IsezeranoLogo className="w-16 h-16" />
                </div>
                <CardTitle className="text-3xl font-headline">{t('loginPage.noAdminTitle')}</CardTitle>
                <CardDescription>
                    {t('loginPage.noAdminDescription')}
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" asChild>
                        <Link href="/register">{t('loginPage.registerAdmin')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IsezeranoLogo className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-headline">{t('loginPage.welcomeBack')}</CardTitle>
          <CardDescription>
            {t('loginPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "email" | "username")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">{t('loginPage.adminTab')}</TabsTrigger>
              <TabsTrigger value="username">{t('loginPage.memberTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('loginPage.email')}</FormLabel>
                                <FormControl>
                                <Input 
                                    placeholder={t('loginPage.emailPlaceholder')}
                                    {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('loginPage.password')}</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder={t('loginPage.passwordPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('loginPage.signingIn') : t('loginPage.signIn')}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
             <TabsContent value="username">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('loginPage.username')}</FormLabel>
                                <FormControl>
                                <Input 
                                    placeholder={t('loginPage.usernamePlaceholder')}
                                    {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('loginPage.password')}</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder={t('loginPage.passwordPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('loginPage.signingIn') : t('loginPage.signIn')}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
