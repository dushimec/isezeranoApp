
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
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
import { useFirebase, useFirestore } from "@/firebase";
import { USER_ROLES } from "@/lib/user-roles";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]\d{3}[)])?[\s-]?(\d{3})[\s-]?(\d{4})$/
);

const FormSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
});

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { auth } = useFirebase();
  const firestore = useFirestore();

   React.useEffect(() => {
    const checkAdmin = async () => {
      if (!firestore) return;
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("role", "==", USER_ROLES.ADMIN), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          toast({
            title: "Admin Exists",
            description: "An admin account already exists. Please log in.",
          });
          router.replace('/login');
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
      fullName: "",
      phone: "",
    },
  });

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setupRecaptcha();
    if (!auth) {
       toast({ variant: "destructive", title: "Authentication Error", description: "Firebase Auth is not initialized." });
       setIsLoading(false);
       return;
    }

    try {
      // 1. Send OTP
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, data.phone, appVerifier);
      window.confirmationResult = confirmationResult;

      // 2. Store registration details temporarily to be picked up on OTP page
      localStorage.setItem('registrationDetails', JSON.stringify({
        fullName: data.fullName,
        phoneNumber: data.phone,
        role: USER_ROLES.ADMIN,
      }));

      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number for verification.",
      });

      // 3. Redirect to OTP page
      router.push(`/otp?phone=${encodeURIComponent(data.phone)}&register=true`);

    } catch (error: any) {
      console.error("Error during admin registration:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not send OTP. Please try again.",
      });
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
            // @ts-ignore
            grecaptcha.reset(widgetId);
        });
      }
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
          <CardTitle className="text-3xl font-headline">Admin Registration</CardTitle>
          <CardDescription>
            Create the first administrator account for Isezerano CMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register and Send OTP"}
              </Button>
            </form>
          </Form>
          <div id="recaptcha-container" className="mt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
}
