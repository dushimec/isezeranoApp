'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface UserProfile {
    id: string;
    phoneNumber: string;
    role: 'Singer' | 'Secretary' | 'Disciplinarian' | 'Admin';
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
}

export const useAuth = () => {
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
