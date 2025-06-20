import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../lib/api';

interface SyncStatus {
  sync_available: boolean;
  cooldown_active: boolean;
  cooldown_remaining_seconds: number;
  cooldown_remaining_minutes: number;
  next_sync_available_at: string;
}

interface SyncResult {
  status: string;
  message: string;
  task_id: string;
  cache_invalidated: {
    backend_entries: number;
    strategy_entries?: number;
    strategy_cache?: string;
  };
  cooldown_period_minutes: number;
  estimated_completion_minutes: number;
  next_sync_available_at: string;
  progress?: {
    current_step: string;
    completed_endpoints: number;
    total_endpoints: number;
    percentage: number;
  };
}

interface TaskStatus {
  task_id: string;
  status: string;
  message: string;
  task_state: string;
  progress: {
    current_step: string;
    completed_endpoints: number;
    total_endpoints: number;
    percentage: number;
  };
}

export const useDashboardSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskStatus | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const FETCH_COOLDOWN = 30000; // 30 seconds between sync status checks

  // Fetch sync status with debouncing
  const fetchSyncStatus = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < FETCH_COOLDOWN) {
      return; // Skip if we fetched recently
    }
    
    try {
      lastFetchRef.current = now;
      const status = await apiClient.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  }, []);

  // Fetch sync status on mount, but only once every 30 seconds
  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // Poll task status when we have an active task
  useEffect(() => {
    if (currentTaskId && isLoading) {
      startTaskPolling(currentTaskId);
    } else {
      stopTaskPolling();
    }

    return () => stopTaskPolling();
  }, [currentTaskId, isLoading]);

  const startTaskPolling = (taskId: string) => {
    stopTaskPolling(); // Clear any existing polling
    
    const pollTask = async () => {
      try {
        const taskStatus: TaskStatus = await apiClient.getTaskStatus(taskId);
        
        setTaskProgress(taskStatus);
        
        if (taskStatus.status === 'completed') {
          setIsLoading(false);
          setCurrentTaskId(null);
          setLastSyncResult(prev => prev ? {
            ...prev,
            status: 'completed',
            message: 'Dashboard sync completed successfully',
            progress: taskStatus.progress
          } : null);
          stopTaskPolling();
          
          // Refresh sync status
          fetchSyncStatus();
        } else if (taskStatus.status === 'failed' || taskStatus.status === 'error') {
          setIsLoading(false);
          setCurrentTaskId(null);
          setError(taskStatus.message);
          stopTaskPolling();
        }
        // If still in_progress, continue polling
        
      } catch (error) {
        console.error('Error polling task status:', error);
        // Don't stop polling on network errors, might be temporary
      }
    };

    // Poll immediately, then every 2 seconds
    pollTask();
    pollIntervalRef.current = setInterval(pollTask, 2000);
  };

  const stopTaskPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const triggerSync = async (): Promise<SyncResult | null> => {
    setIsLoading(true);
    setError(null);
    setTaskProgress(null);

    try {
      const result = await apiClient.syncDashboard();
      
      if (result.status === 'in_progress') {
        setCurrentTaskId(result.task_id);
        setLastSyncResult(result);
        // Don't set isLoading to false yet - wait for task completion
      } else if (result.status === 'completed') {
        setIsLoading(false);
        setLastSyncResult(result);
      } else {
        setIsLoading(false);
        setError(result.message || 'Sync failed');
      }

      return result;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'Failed to trigger sync');
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Compute derived state
  const isSyncAvailable = syncStatus?.sync_available ?? true;
  const cooldownInfo = syncStatus ? {
    remainingSeconds: syncStatus.cooldown_remaining_seconds,
    remainingMinutes: syncStatus.cooldown_remaining_minutes,
    nextAvailable: syncStatus.next_sync_available_at
  } : null;

  return {
    isLoading,
    isSyncAvailable,
    cooldownInfo,
    error,
    lastSyncResult,
    taskProgress,
    triggerSync,
    clearError
  };
}; 