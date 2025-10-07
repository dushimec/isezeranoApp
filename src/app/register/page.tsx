
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useFirestore } from "@/firebase";
import { USER_ROLES } from "@/lib/user-roles";
import Link from "next/link";

const FormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const firestore = useFirestore();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!firestore) return;
      try {
        const usersRef = collection(firestore, "users");
        const q = query(
          usersRef,
          where("role", "==", USER_ROLES.ADMIN),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          toast({
            title: "Admin Exists",
            description: "An admin account already exists. Please log in.",
          });
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking for admin:", error);
      }
    };
    checkAdmin();
  }, [firestore, router, toast]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to create admin user.');
      }
      
      toast({
        title: "Admin Account Created",
        description: "You have been successfully registered. Please log in.",
      });

      router.push(`/login`);
    } catch (error: any) {
      console.error("Error during admin registration:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IsezeranoLogo className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-headline">
            Admin Registration
          </CardTitle>
          <CardDescription>
            Create the first administrator account for Isezerano CMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="janedoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
