
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/auth-provider';
import { USER_ROLES } from '@/lib/user-roles';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case USER_ROLES.DISCIPLINARIAN:
          router.push('/disciplinarian/dashboard');
          break;
        case USER_ROLES.SECTION_LEADER:
          router.push('/section-leader/dashboard');
          break;
        case USER_ROLES.CHOIR_MEMBER:
          router.push('/choir-member/dashboard');
          break;
        default:
          // Redirect to a generic dashboard or login if role is unknown
          router.push('/');
          break;
      }
    } else if (!loading && !user) {
        // redirect to login if not authenticated
        router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
