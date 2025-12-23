
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES, UserRole } from './user-roles';
import { useRouter } from 'next/navigation';
import { ComponentType } from 'react';

export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  role: UserRole
) {
  const WithRole = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <div>Loading...</div>; // Or a spinner
    }

    if (!user || user.role !== role) {
      router.replace('/unauthorized');
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithRole;
}
