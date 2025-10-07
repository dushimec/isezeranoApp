"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { SignJWT } from "jose";

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
import { useFirebase } from "@/firebase";

const OTPSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "Your one-time password must be 6 characters." }),
});

declare global {
  interface Window {
    confirmationResult: any;
  }
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { firestore } = useFirebase();

  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  React.useEffect(() => {
    if (!phone) {
      router.push("/login");
    }
  }, [phone, router]);

  async function onSubmit(data: z.infer<typeof OTPSchema>) {
    setIsLoading(true);
    if (!window.confirmationResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No OTP confirmation found. Please try logging in again.",
      });
      router.push("/login");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(data.otp);
      const user = result.user;

      if (user && firestore) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Generate JWT
          // IMPORTANT: In a production environment, use a secure secret stored in an environment variable.
          const secret = new TextEncoder().encode(
            "super-secret-key-for-dev-only"
          );
          const alg = "HS256";
          const jwt = await new SignJWT({
            userId: user.uid,
            role: userData.role,
            phoneNumber: user.phoneNumber,
          })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(secret);

          localStorage.setItem("token", jwt);


          toast({
            title: "Success!",
            description: "You have been successfully logged in.",
          });
          // Redirect based on role
          switch (userData.role) {
            case "Admin":
              router.push("/admin/dashboard");
              break;
            case "Secretary":
              router.push("/secretary/dashboard");
              break;
            case "Disciplinarian":
              router.push("/disciplinarian/dashboard");
              break;
            case "Singer":
              router.push("/singer/dashboard");
              break;
            default:
              router.push("/dashboard");
          }
        } else {
           toast({
            variant: "destructive",
            title: "Login Failed",
            description: "User profile not found.",
          });
          router.push("/login");
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
      });
      form.reset();
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
          <CardTitle className="text-3xl font-headline">Enter OTP</CardTitle>
          <CardDescription>
            A 6-digit code was sent to {phone}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        {...field}
                        maxLength={6}
                        className="text-center text-lg tracking-[0.5em]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <p>
              Didn't receive the code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() =>
                  toast({
                    title: "OTP Resent",
                    description: "A new OTP has been sent.",
                  })
                }
              >
                Resend
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
