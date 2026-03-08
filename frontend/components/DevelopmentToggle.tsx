'use client';

import React, { useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const DevelopmentToggle: React.FC = () => {
  const { isOnline, setIsOnline } = useNetworkStatus();
  const [showToggle, setShowToggle] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggleOffline = () => {
    setIsOnline(!isOnline);
    console.log('[v0] Dev: Toggled offline mode to', !isOnline);
  };

  if (!showToggle) {
    return (
      <button
        onClick={() => setShowToggle(true)}
        className="fixed bottom-4 left-4 w-10 h-10 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center hover:bg-gray-900 transition-colors z-40 shadow-lg"
        title="Toggle dev mode (dev only)"
      >
        <span className="text-xs font-bold">DEV</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-card rounded-lg shadow-lg p-4 z-40 border border-border">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggleOffline}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isOnline
              ? 'bg-green-500/20 text-green-700 hover:bg-green-200'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Offline</span>
            </>
          )}
        </button>
        <button
          onClick={() => setShowToggle(false)}
          className="text-muted-foreground hover:text-foreground text-sm font-medium"
        >
          Hide
        </button>
      </div>
    </div>
  );
};
