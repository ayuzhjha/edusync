'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface NetworkContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  setIsOnline: (online: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string | undefined>();

  useEffect(() => {
    // Initialize with current online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => {
      console.log('[v0] Network: going online');
      setIsOnline(true);
      // Trigger sync when coming online
      window.dispatchEvent(new CustomEvent('app-online'));
    };

    const handleOffline = () => {
      console.log('[v0] Network: going offline');
      setIsOnline(false);
    };

    // Detect connection type and quality
    const checkConnection = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType; // 4g, 3g, 2g, slow-2g
        setConnectionType(effectiveType);
        setIsSlowConnection(effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g');
      }
    };

    checkConnection();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', checkConnection);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', checkConnection);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isSlowConnection, connectionType, setIsOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkStatus = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkProvider');
  }
  return context;
};
