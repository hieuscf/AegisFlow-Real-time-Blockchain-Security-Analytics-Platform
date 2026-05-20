import { randomUUID } from "node:crypto";

import type { AuditResult, SecurityAlert } from "../models/types";
import { getPool } from "./client";

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
  const db = getPool();
  const result = await db.query<{
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
  }>(
    `SELECT id, level, type, title, message,
            token_address, contract_address, pair_address, tx_hash, metadata, created_at
     FROM alerts
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
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
  }));
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
