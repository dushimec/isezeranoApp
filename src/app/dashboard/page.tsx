
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/lib/user-roles';

export default function DashboardRedirect() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && userProfile) {
        switch (userProfile.role) {
          case USER_ROLES.ADMIN:
            router.replace('/dashboard'); // Admin stays on the main dashboard
            break;
          case USER_ROLES.SECRETARY:
            router.replace('/dashboard'); 
            break;
          case USER_ROLES.DISCIPLINARIAN:
            router.replace('/dashboard');
            break;
          case USER_ROLES.SINGER:
             router.replace('/dashboard');
            break;
          default:
            router.replace('/login');
            break;
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, userProfile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loader">Loading...</div>
    </div>
  );
}
