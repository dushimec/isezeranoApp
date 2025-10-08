"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { t } from "@/utils/i18n";

interface UserRegistrationFormProps {
  onUserCreated: () => void;
}

const creatableRoles: Role[] = ['SECRETARY', 'DISCIPLINARIAN', 'SINGER'];

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(creatableRoles as [string, ...string[]]),
  profileImage: z.string().optional(),
});

export function UserRegistrationForm({ onUserCreated }: UserRegistrationFormProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: 'SINGER',
      profileImage: "",
    },
  });

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user.');
      }

      toast({
        title: "User Created",
        description: `An account for ${values.firstName} ${values.lastName} has been created.`,
      });
      
      form.reset();
      setImagePreview(null);
      onUserCreated(); // Callback to parent component
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="flex items-center gap-4">
          <Image
            src={imagePreview || `https://picsum.photos/seed/new-user/100/100`}
            width={80}
            height={80}
            alt="Profile preview"
            className="rounded-full object-cover"
          />
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">{t("userRegistrationForm.profilePicture")}</Label>
            <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userRegistrationForm.firstName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("userRegistrationForm.placeholder.firstName")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userRegistrationForm.lastName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("userRegistrationForm.placeholder.lastName")} {...field} />
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
              <FormLabel>{t("userRegistrationForm.username")}</FormLabel>
              <FormControl>
                <Input placeholder={t("userRegistrationForm.placeholder.username")} {...field} />
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
              <FormLabel>{t("userRegistrationForm.email")}</FormLabel>
              <FormControl>
                <Input placeholder={t("userRegistrationForm.placeholder.email")} {...field} />
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
              <FormLabel>{t("userRegistrationForm.password")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t("userRegistrationForm.placeholder.password")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userRegistrationForm.role")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("userRegistrationForm.selectRole")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {creatableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("userRegistrationForm.registering") : t("userRegistrationForm.registerUser")}
        </Button>
      </form>
    </Form>
  );
}
