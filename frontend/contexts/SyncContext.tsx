'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, dbUtils, type SyncQueueItem } from '@/lib/db';
import { useAuth } from './AuthContext';
import { useNetworkStatus } from './NetworkContext';
import { apiService } from '@/lib/api';

export interface SyncContextType {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime?: number;
  syncError?: string;
  runSync: () => Promise<void>;
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>();
  const [syncError, setSyncError] = useState<string>();

  // Refresh pending count directly from DB (source of truth)
  const refreshPendingCount = useCallback(async () => {
    if (!user) { setPendingCount(0); return; }
    const items = await dbUtils.getPendingSyncItems(user.id);
    setPendingCount(items.length);
  }, [user]);

  // Poll every 3 seconds to keep count accurate
  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 3000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const runSync = useCallback(async () => {
    if (!user || isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncError(undefined);

    try {
      const pendingItems = await dbUtils.getPendingSyncItems(user.id);
      console.log(`[v0] Sync: Processing ${pendingItems.length} items`);

      for (const item of pendingItems) {
        try {
          console.log(`[v0] Sync: Syncing ${item.type} (${item.resourceId})`);

          if (item.type === 'progress') {
            await apiService.post('/student/progress', item.payload);
            // Mark the underlying progress record as synced
            const progress = await db.progress.get(item.resourceId);
            if (progress) {
              progress.synced = true;
              await db.progress.put(progress);
            }
          } else if (item.type === 'quiz_result') {
            await apiService.post('/student/quiz-results', item.payload);
            const result = await db.quizResults.get(item.resourceId);
            if (result) {
              result.synced = true;
              await db.quizResults.put(result);
            }
          }

          // Remove successfully synced item from queue
          await dbUtils.removeSyncQueueItem(item.id);
          console.log(`[v0] Sync: Successfully synced ${item.type}`);
        } catch (error) {
          console.error(`[v0] Sync error for item ${item.id}:`, error);
          const newRetryCount = (item.retryCount || 0) + 1;
          if (newRetryCount >= 3) {
            // Purge dead items so they don't inflate the count forever
            console.error(`[v0] Sync: Purging failed item ${item.id} after max retries`);
            await dbUtils.removeSyncQueueItem(item.id);
          } else {
            await dbUtils.updateSyncQueueItem(item.id, {
              retryCount: newRetryCount,
              lastRetryAt: Date.now(),
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      setLastSyncTime(Date.now());
      console.log('[v0] Sync: Completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      console.error('[v0] Sync error:', message);
      setSyncError(message);
    } finally {
      setIsSyncing(false);
      // Re-read actual count from DB instead of assuming 0
      await refreshPendingCount();
    }
  }, [user, isSyncing, isOnline, refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing && pendingCount > 0) {
      console.log('[v0] Sync: Auto-syncing due to network change');
      runSync();
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToQueue = useCallback(async (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>) => {
    if (!user) return;

    const queueItem: SyncQueueItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      retryCount: 0,
    };

    await dbUtils.addToSyncQueue(queueItem);
    await refreshPendingCount(); // read from DB, don't just +1

    // Try to sync immediately if online
    if (isOnline && !isSyncing) {
      await runSync();
    }
  }, [user, isOnline, isSyncing, runSync, refreshPendingCount]);

  return (
    <SyncContext.Provider
      value={{
        pendingCount,
        isSyncing,
        lastSyncTime,
        syncError,
        runSync,
        addToQueue,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncStatus = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncStatus must be used within SyncProvider');
  }
  return context;
};
