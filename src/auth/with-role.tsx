
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have a useAuth hook

const withRole = (WrappedComponent, role) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>; // Or a spinner
    }

    if (!user) {
      router.replace("/login");
      return null;
    }

    if (user.role !== role) {
      router.replace("/unauthorized"); // Or redirect to their own dashboard
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withRole;
