import type { AlertLevel, SecurityAlert } from "../models/types";

const MAX_IN_MEMORY = 500;

const notifications: SecurityAlert[] = [];

/**
 * Ring buffer for notifications when Postgres is unavailable or as a hot cache.
 */
export function pushNotification(alert: SecurityAlert): void {
  notifications.unshift(alert);
  if (notifications.length > MAX_IN_MEMORY) {
    notifications.length = MAX_IN_MEMORY;
  }
}

export function getNotificationFromMemory(id: string): SecurityAlert | null {
  return notifications.find((n) => n.id === id) ?? null;
}

export interface MemoryListQuery {
  limit: number;
  offset: number;
  level?: AlertLevel;
  type?: string;
  since?: string;
  tokenAddress?: string;
}

export function listNotificationsFromMemory(
  query: MemoryListQuery,
): { items: SecurityAlert[]; total: number } {
  let filtered = [...notifications];

  if (query.level) {
    filtered = filtered.filter((n) => n.level === query.level);
  }
  if (query.type) {
    const typeLower = query.type.toLowerCase();
    filtered = filtered.filter((n) => n.type.toLowerCase().includes(typeLower));
  }
  if (query.tokenAddress) {
    const addr = query.tokenAddress.toLowerCase();
    filtered = filtered.filter(
      (n) => n.tokenAddress?.toLowerCase() === addr,
    );
  }
  if (query.since) {
    const sinceMs = Date.parse(query.since);
    if (Number.isFinite(sinceMs)) {
      filtered = filtered.filter(
        (n) => Date.parse(n.createdAt) >= sinceMs,
      );
    }
  }

  const total = filtered.length;
  const items = filtered.slice(query.offset, query.offset + query.limit);
  return { items, total };
}

export function getNotificationStatsFromMemory(): Record<AlertLevel, number> {
  const stats: Record<AlertLevel, number> = {
    INFO: 0,
    WARNING: 0,
    CRITICAL: 0,
  };

  for (const n of notifications) {
    stats[n.level] += 1;
  }

  return stats;
}
