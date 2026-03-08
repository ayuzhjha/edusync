'use client';

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-lg z-50">
      <WifiOff className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-sm">You are offline</p>
        <p className="text-xs opacity-90">Your changes will sync when you're back online</p>
      </div>
    </div>
  );
};
