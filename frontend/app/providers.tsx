'use client';

import React from 'react';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SyncProvider } from '@/contexts/SyncContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <AuthProvider>
        <SyncProvider>
          {children}
        </SyncProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}
