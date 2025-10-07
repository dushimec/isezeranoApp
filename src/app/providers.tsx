
'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { StoreProvider } from '@/store/StoreProvider';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>{children}</AuthProvider>
    </StoreProvider>
  );
}
