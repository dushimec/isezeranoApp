
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import type { User as UserProfile } from '@/lib/types';


export interface AuthHookResult {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = (): AuthHookResult => {
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  return {
    user,
    userProfile,
    loading: isUserLoading || isProfileLoading,
    error: userError || profileError,
  };
};
