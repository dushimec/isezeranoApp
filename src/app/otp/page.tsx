
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getAuth } from "firebase/auth";

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
import { USER_ROLES } from "@/lib/user-roles";

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
  const isRegistering = searchParams.get("register") === 'true';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

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
        description: "No OTP confirmation found. Please try again.",
      });
      router.push(isRegistering ? "/register" : "/login");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(data.otp);
      const user = result.user;

      if (user) {
        const idToken = await user.getIdToken();
        let apiEndpoint = '/api/auth/verify-otp';
        let body: any = { idToken };

        if (isRegistering) {
          apiEndpoint = '/api/auth/register';
          const regDetails = JSON.parse(localStorage.getItem('registrationDetails') || '{}');
          body = { ...body, ...regDetails, uid: user.uid };
        }

        const backendResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            throw new Error(errorData.error || 'Backend verification failed.');
        }

        if (isRegistering) {
          localStorage.removeItem('registrationDetails');
        }

        const { token, user: userProfile } = await backendResponse.json();
        
        localStorage.setItem("token", token);
        
        toast({
            title: "Success!",
            description: `You have been successfully ${isRegistering ? 'registered and' : ''} logged in.`,
        });

        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      let description = "The OTP you entered is incorrect. Please try again.";
      if (error.message.includes('auth/')) {
          description = error.message.split(' (auth/')[0];
      } else if (error.message) {
          description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: description,
      });
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleResend = async () => {
    if (!phone) return;
    try {
        const auth = getAuth();
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await auth.signInWithPhoneNumber(phone, appVerifier);
        window.confirmationResult = confirmationResult;
        toast({
            title: "OTP Resent",
            description: "A new OTP has been sent to your phone.",
        });
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Failed to Resend OTP",
            description: error.message || "An unexpected error occurred.",
        });
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
                onClick={handleResend}
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

