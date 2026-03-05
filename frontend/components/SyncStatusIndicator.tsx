'use client';

import React from 'react';
import { Cloud, CloudOff, Loader2, Check, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export const SyncStatusIndicator: React.FC = () => {
  const { pendingCount, isSyncing, lastSyncTime, runSync } = useSyncStatus();

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 px-3 py-2 rounded-md bg-blue-50">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-700 px-3 py-2 rounded-md bg-yellow-50">
        <CloudOff className="w-4 h-4" />
        <span>{pendingCount} pending</span>
        <button
          onClick={runSync}
          title="Retry sync now"
          className="ml-1 p-0.5 hover:text-yellow-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (lastSyncTime) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 px-3 py-2 rounded-md bg-green-50">
        <Check className="w-4 h-4" />
        <span>All synced</span>
      </div>
    );
  }

  // Nothing pending, never synced yet — show subtle online indicator
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2 rounded-md bg-gray-50">
      <Cloud className="w-4 h-4" />
      <span>Ready</span>
    </div>
  );
};
