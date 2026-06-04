import { isPostgresAvailable } from "../database/availability";
import {
  countAlertsByLevel,
  getAlertById,
  listAlertsFiltered,
} from "../database/repository";
import type { AlertLevel, SecurityAlert } from "../models/types";
import type { NotificationListQuery } from "./query";
import {
  getNotificationFromMemory,
  getNotificationStatsFromMemory,
  listNotificationsFromMemory,
} from "./store";

export type NotificationSource = "postgres" | "memory";

export interface NotificationListResult {
  data: SecurityAlert[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    source: NotificationSource;
  };
}

export interface NotificationStatsResult {
  total: number;
  byLevel: Record<AlertLevel, number>;
  source: NotificationSource;
}

export async function listNotifications(
  query: NotificationListQuery,
): Promise<NotificationListResult> {
  if (isPostgresAvailable()) {
    try {
      const { items, total } = await listAlertsFiltered(query);
      return {
        data: items,
        meta: {
          total,
          limit: query.limit,
          offset: query.offset,
          source: "postgres",
        },
      };
    } catch {
      // fall through to memory
    }
  }

  const { items, total } = listNotificationsFromMemory(query);
  return {
    data: items,
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
      source: "memory",
    },
  };
}

export async function getNotification(
  id: string,
): Promise<{ notification: SecurityAlert; source: NotificationSource } | null> {
  if (isPostgresAvailable()) {
    try {
      const fromDb = await getAlertById(id);
      if (fromDb) {
        return { notification: fromDb, source: "postgres" };
      }
    } catch {
      // fall through
    }
  }

  const fromMemory = getNotificationFromMemory(id);
  if (fromMemory) {
    return { notification: fromMemory, source: "memory" };
  }

  return null;
}

export async function getNotificationStats(): Promise<NotificationStatsResult> {
  if (isPostgresAvailable()) {
    try {
      const byLevel = await countAlertsByLevel();
      const total = byLevel.INFO + byLevel.WARNING + byLevel.CRITICAL;
      return { total, byLevel, source: "postgres" };
    } catch {
      // fall through
    }
  }

  const byLevel = getNotificationStatsFromMemory();
  const total = byLevel.INFO + byLevel.WARNING + byLevel.CRITICAL;
  return { total, byLevel, source: "memory" };
}
