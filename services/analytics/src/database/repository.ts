import { randomUUID } from "node:crypto";

import type { AlertLevel, AuditResult, SecurityAlert } from "../models/types";
import { getPool } from "./client";

export interface ListAlertsQuery {
  limit: number;
  offset: number;
  level?: AlertLevel;
  type?: string;
  since?: string;
  tokenAddress?: string;
}

interface AlertRow {
  id: string;
  level: SecurityAlert["level"];
  type: string;
  title: string;
  message: string;
  token_address: string | null;
  contract_address: string | null;
  pair_address: string | null;
  tx_hash: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

function mapAlertRow(row: AlertRow): SecurityAlert {
  return {
    id: row.id,
    level: row.level,
    type: row.type,
    title: row.title,
    message: row.message,
    tokenAddress: row.token_address ?? undefined,
    contractAddress: row.contract_address ?? undefined,
    pairAddress: row.pair_address ?? undefined,
    txHash: row.tx_hash ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function buildListAlertsClauses(query: ListAlertsQuery): {
  conditions: string[];
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.level) {
    params.push(query.level);
    conditions.push(`level = $${params.length}`);
  }
  if (query.type) {
    params.push(`%${query.type}%`);
    conditions.push(`type ILIKE $${params.length}`);
  }
  if (query.tokenAddress) {
    params.push(query.tokenAddress.toLowerCase());
    conditions.push(`LOWER(token_address) = $${params.length}`);
  }
  if (query.since) {
    const sinceDate = new Date(query.since);
    if (Number.isFinite(sinceDate.getTime())) {
      params.push(sinceDate.toISOString());
      conditions.push(`created_at >= $${params.length}`);
    }
  }

  return { conditions, params };
}

export async function saveAlert(alert: SecurityAlert): Promise<void> {
  const db = getPool();

  await db.query(
    `INSERT INTO alerts (
      id, level, type, title, message,
      token_address, contract_address, pair_address, tx_hash, metadata, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      alert.id,
      alert.level,
      alert.type,
      alert.title,
      alert.message,
      alert.tokenAddress ?? null,
      alert.contractAddress ?? null,
      alert.pairAddress ?? null,
      alert.txHash ?? null,
      alert.metadata ?? null,
      alert.createdAt,
    ],
  );
}

export async function listAlerts(limit = 50): Promise<SecurityAlert[]> {
  const { items } = await listAlertsFiltered({ limit, offset: 0 });
  return items;
}

export async function listAlertsFiltered(
  query: ListAlertsQuery,
): Promise<{ items: SecurityAlert[]; total: number }> {
  const db = getPool();
  const { conditions, params } = buildListAlertsClauses(query);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM alerts ${where}`,
    params,
  );
  const total = Number.parseInt(countResult.rows[0]?.count ?? "0", 10);

  const listParams = [...params, query.limit, query.offset];
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const result = await db.query<AlertRow>(
    `SELECT id, level, type, title, message,
            token_address, contract_address, pair_address, tx_hash, metadata, created_at
     FROM alerts
     ${where}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    listParams,
  );

  return {
    items: result.rows.map(mapAlertRow),
    total: Number.isFinite(total) ? total : 0,
  };
}

export async function getAlertById(id: string): Promise<SecurityAlert | null> {
  const db = getPool();
  const result = await db.query<AlertRow>(
    `SELECT id, level, type, title, message,
            token_address, contract_address, pair_address, tx_hash, metadata, created_at
     FROM alerts
     WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapAlertRow(row) : null;
}

export async function countAlertsByLevel(): Promise<Record<AlertLevel, number>> {
  const db = getPool();
  const result = await db.query<{ level: AlertLevel; count: string }>(
    `SELECT level, COUNT(*)::text AS count FROM alerts GROUP BY level`,
  );

  const stats: Record<AlertLevel, number> = {
    INFO: 0,
    WARNING: 0,
    CRITICAL: 0,
  };

  for (const row of result.rows) {
    stats[row.level] = Number.parseInt(row.count, 10) || 0;
  }

  return stats;
}

export async function saveAuditResult(result: AuditResult): Promise<string> {
  const db = getPool();
  const id = randomUUID();

  await db.query(
    `INSERT INTO audit_results (
      id, contract_address, success, findings, risks, raw_output, error_message, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id,
      result.contractAddress,
      result.success,
      JSON.stringify(result.findings),
      JSON.stringify(result.risks),
      result.rawOutput ?? null,
      result.errorMessage ?? null,
      result.completedAt,
    ],
  );

  return id;
}
