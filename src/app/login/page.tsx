
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
            toast({ variant: "destructive", title: "Error", description: "Could not verify system status." });
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
            throw new Error(data.error || 'Login failed');
        }
        
        login(data.token, data.user);

        toast({
            title: "Login Successful",
            description: `Welcome back, ${data.user.firstName}!`,
        });
        router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (adminExists === null) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">Verifying system status...</div>
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
                <CardTitle className="text-3xl font-headline">Welcome</CardTitle>
                <CardDescription>
                    No administrator account exists. Please register to begin.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" asChild>
                        <Link href="/register">Register Admin Account</Link>
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
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue to Isezerano CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "email" | "username")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Admin</TabsTrigger>
              <TabsTrigger value="username">Member</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input 
                                    placeholder='admin@example.com'
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
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
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                <Input 
                                    placeholder='your.username'
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
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
