import { randomUUID } from "node:crypto";

import { loadConfig } from "../config/env";
import type { AlertLevel, SecurityAlert } from "../models/types";

const LOG_PREFIX = "[alerts]";

type AlertHandler = (alert: SecurityAlert) => void | Promise<void>;

const dedupeCache = new Map<string, number>();
const handlers = new Set<AlertHandler>();

function dedupeKey(level: AlertLevel, type: string, tokenAddress?: string): string {
  return `${level}:${type}:${(tokenAddress ?? "global").toLowerCase()}`;
}

function isDuplicate(key: string, ttlSeconds: number): boolean {
  const now = Date.now();
  const expiresAt = dedupeCache.get(key);

  if (expiresAt !== undefined && expiresAt > now) {
    return true;
  }

  dedupeCache.set(key, now + ttlSeconds * 1000);
  return false;
}

export function registerAlertHandler(handler: AlertHandler): void {
  handlers.add(handler);
}

export function unregisterAlertHandler(handler: AlertHandler): void {
  handlers.delete(handler);
}

export interface CreateAlertInput {
  level: AlertLevel;
  type: string;
  title: string;
  message: string;
  tokenAddress?: string;
  contractAddress?: string;
  pairAddress?: string;
  txHash?: string;
  metadata?: Record<string, unknown>;
  skipDedupe?: boolean;
}

/**
 * Creates a timestamped alert and notifies registered handlers.
 */
export async function createAlert(input: CreateAlertInput): Promise<SecurityAlert | null> {
  const config = loadConfig();
  const key = dedupeKey(input.level, input.type, input.tokenAddress);

  if (!input.skipDedupe && isDuplicate(key, config.alerts.dedupeTtlSeconds)) {
    console.log(`${LOG_PREFIX} Deduped alert type=${input.type} token=${input.tokenAddress ?? "n/a"}`);
    return null;
  }

  const alert: SecurityAlert = {
    id: randomUUID(),
    level: input.level,
    type: input.type,
    title: input.title,
    message: input.message,
    tokenAddress: input.tokenAddress,
    contractAddress: input.contractAddress,
    pairAddress: input.pairAddress,
    txHash: input.txHash,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };

  console.log(
    `${LOG_PREFIX} ${alert.level} type=${alert.type} title="${alert.title}"`,
  );

  await Promise.all(
    Array.from(handlers).map(async (handler) => {
      try {
        await handler(alert);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`${LOG_PREFIX} Handler error: ${message}`);
      }
    }),
  );

  return alert;
}
