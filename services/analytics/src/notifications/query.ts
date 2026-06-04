import type { Request } from "express";

import type { AlertLevel } from "../models/types";

const ALERT_LEVELS: AlertLevel[] = ["INFO", "WARNING", "CRITICAL"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface NotificationListQuery {
  limit: number;
  offset: number;
  level?: AlertLevel;
  type?: string;
  since?: string;
  tokenAddress?: string;
}

function parsePositiveInt(raw: unknown, fallback: number, max: number): number {
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.min(parsed, max);
}

function parseLevel(raw: unknown): AlertLevel | undefined {
  const value = String(raw ?? "").trim().toUpperCase();
  if (ALERT_LEVELS.includes(value as AlertLevel)) {
    return value as AlertLevel;
  }
  return undefined;
}

export function parseNotificationListQuery(req: Request): NotificationListQuery {
  const level = parseLevel(req.query.level);
  const type = String(req.query.type ?? "").trim() || undefined;
  const since = String(req.query.since ?? "").trim() || undefined;
  const tokenAddress =
    String(req.query.tokenAddress ?? req.query.token ?? "").trim() || undefined;

  return {
    limit: parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT),
    offset: parsePositiveInt(req.query.offset, 0, 10_000),
    level,
    type,
    since,
    tokenAddress,
  };
}

export function parseNotificationIdParam(raw: string): string | null {
  const id = raw.trim();
  if (!id || id.length > 64) {
    return null;
  }
  return id;
}
