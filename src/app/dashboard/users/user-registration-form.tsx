
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
import { USER_ROLES } from "@/lib/user-roles";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]\d{3}[)])?[\s-]?(\d{3})[\s-]?(\d{4})$/
);

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
  role: z.nativeEnum(USER_ROLES),
});

export function UserRegistrationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      role: USER_ROLES.SINGER,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not available.",
        });
        return;
    }
    setIsLoading(true);

    const usersCollectionRef = collection(firestore, 'users');
    
    const userProfile = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      role: values.role,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileImageUrl: `https://picsum.photos/seed/${Math.random()}/400/400`,
    };

    try {
        addDocumentNonBlocking(usersCollectionRef, userProfile);

        toast({
            title: "User Registration Submitted",
            description: `Profile for ${values.fullName} is being created.`,
        });
        
        form.reset();
    } catch (error) {
        // This catch block is primarily for unexpected client-side errors,
        // as the non-blocking function handles the Firestore-specific errors.
        toast({
            variant: "destructive",
            title: "Client Error",
            description: "An unexpected error occurred while submitting the form.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
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
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(USER_ROLES).map((role) => (
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
            {isLoading ? 'Registering...' : 'Register User'}
        </Button>
      </form>
    </Form>
  );
}
