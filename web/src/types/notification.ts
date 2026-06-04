import type { SecurityAlert } from './alert';

export type NotificationSource = 'postgres' | 'memory';

export interface NotificationListParams {
  limit?: number;
  offset?: number;
  level?: 'INFO' | 'WARNING' | 'CRITICAL';
  type?: string;
  since?: string;
  tokenAddress?: string;
}

export interface NotificationListMeta {
  total: number;
  limit: number;
  offset: number;
  source: NotificationSource;
}

export interface NotificationListResponse {
  data: SecurityAlert[];
  meta: NotificationListMeta;
}

export interface NotificationStatsResponse {
  total: number;
  byLevel: Record<'INFO' | 'WARNING' | 'CRITICAL', number>;
  source: NotificationSource;
}

export interface NotificationDetailResponse {
  data: SecurityAlert;
  meta: { source: NotificationSource };
}
