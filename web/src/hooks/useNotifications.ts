import { useCallback, useEffect, useState } from 'react';

import { api } from '@/services/api';
import type { SecurityAlert } from '@/types/alert';
import type {
  NotificationListParams,
  NotificationStatsResponse,
} from '@/types/notification';

interface UseNotificationsResult {
  notifications: SecurityAlert[];
  stats: NotificationStatsResponse | null;
  total: number;
  source: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNotifications(
  params?: NotificationListParams,
  pollIntervalMs = 0,
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<NotificationStatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const [list, statsRes] = await Promise.all([
        api.getNotifications(params),
        api.getNotificationStats(),
      ]);
      setNotifications(list.data);
      setTotal(list.meta.total);
      setSource(list.meta.source);
      setStats(statsRes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params?.limit, params?.offset, params?.level, params?.type, params?.since, params?.tokenAddress]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    const id = window.setInterval(() => {
      void refetch();
    }, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [pollIntervalMs, refetch]);

  return { notifications, stats, total, source, loading, error, refetch };
}
