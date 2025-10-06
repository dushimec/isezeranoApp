"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IsezeranoLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

const OTPSchema = z.object({
  otp: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
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
      router.push('/login');
    }
  }, [phone, router]);

  async function onSubmit(data: z.infer<typeof OTPSchema>) {
    setIsLoading(true);
    // Mock API call to verify OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // In a real app, you'd verify the OTP against a backend service
    if (data.otp === '123456') {
      toast({
        title: "Success!",
        description: "You have been successfully logged in.",
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
      });
      form.reset();
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
              <Button variant="link" className="p-0 h-auto" onClick={() => toast({ title: "OTP Resent", description: "A new OTP has been sent."})}>
                Resend
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
