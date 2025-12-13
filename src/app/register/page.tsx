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
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { t } from "@/utils/i18n";

const FormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [adminExists, setAdminExists] = React.useState<boolean | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

  React.useEffect(() => {
    if(user) {
        router.replace('/dashboard');
    }
  }, [user, router]);
  
  React.useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();

        // Prefer explicit count when available. Fallback to `exists` if count is missing.
        const count = typeof data.count === 'number' ? data.count : (data.exists ? 1 : 0);

        // adminExists here will mean "registration should be blocked" (true when >= 2 admins)
        setAdminExists(count >= 2);

        // Block registration when there are already 2 or more admins
        if (count >= 2) {
          toast({
            title: "Admin Limit Reached",
            description: "There are already 2 or more admin accounts. Please log in.",
          });
          router.replace('/login');
          return;
        }

        // Otherwise allow registration (do not redirect). If count is 0 or 1, user may create an admin.
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not verify system status.' });
      } finally {
        setIsLoading(false);
      }
    }
    checkAdmin();
  }, [router, toast]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('profileImage', dataUri);
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

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
        throw new Error(responseData.message || 'Failed to create admin user.');
      }
      
      toast({
        title: "Admin Account Created",
        description: "You have been successfully registered. Please log in.",
      });

      router.push(`/login`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading || adminExists === null) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">{t("registerPage.verifying")}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IsezeranoLogo className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-headline">
            {t("registerPage.title")}
          </CardTitle>
          <CardDescription>
            {t("registerPage.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="flex items-center gap-4">
                <Image
                  src={imagePreview || `https://picsum.photos/seed/new-admin/100/100`}
                  width={80}
                  height={80}
                  alt="Profile preview"
                  className="rounded-full object-cover"
                />
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture">{t("registerPage.profilePicture")}</Label>
                  <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" />
                </div>
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("registerPage.firstName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("registerPage.placeholder.firstName")} {...field} />
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
                      <FormLabel>{t("registerPage.lastName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("registerPage.placeholder.lastName")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("registerPage.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("registerPage.placeholder.email")} {...field} />
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
                    <FormLabel>{t("registerPage.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("registerPage.placeholder.password")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("registerPage.registering") : t("registerPage.register")}
              </Button>
            </form>
          </Form>
           <p className="text-center text-sm text-muted-foreground mt-6">
            {t("registerPage.alreadyHaveAccount")}{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              {t("registerPage.signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
