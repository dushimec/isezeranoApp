
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

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
import { useAuth, useFirestore } from "@/firebase";
import { USER_ROLES } from "@/lib/user-roles";
import Link from "next/link";

const FormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [adminExists, setAdminExists] = React.useState<boolean | null>(null);
  const auth = useAuth();
  const firestore = useFirestore();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!firestore) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("role", "==", USER_ROLES.ADMIN), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setAdminExists(false);
        } else {
          setAdminExists(true);
        }
      } catch (error) {
        console.error("Error checking for admin:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not verify system status. Please try again."
        })
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, [firestore, toast]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Firebase Auth is not initialized.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error signing in:", error);
      let errorMessage = "An unknown error occurred.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = "No user found with this email.";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password. Please try again.";
            break;
          case 'auth/invalid-credential':
             errorMessage = "Invalid credentials. Please check your email and password.";
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading || adminExists === null) {
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
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
