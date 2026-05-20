import { Pool } from "pg";

import { loadConfig } from "../config/env";

const LOG_PREFIX = "[postgres]";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const config = loadConfig();
    pool = new Pool({
      connectionString: config.postgres.url,
      max: 10,
    });

    pool.on("error", (error: Error) => {
      console.error(`${LOG_PREFIX} Pool error:`, error.message);
    });
  }

  return pool;
}

export async function connectPostgres(): Promise<Pool> {
  const db = getPool();
  await db.query("SELECT 1");
  console.log(`${LOG_PREFIX} Connected`);
  return db;
}

export async function disconnectPostgres(): Promise<void> {
  if (!pool) {
    return;
  }

  const instance = pool;
  pool = null;
  await instance.end();
  console.log(`${LOG_PREFIX} Disconnected`);
}

export async function initSchema(): Promise<void> {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY,
      level VARCHAR(16) NOT NULL,
      type VARCHAR(64) NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      token_address VARCHAR(64),
      contract_address VARCHAR(64),
      pair_address VARCHAR(64),
      tx_hash VARCHAR(80),
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts (level);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_results (
      id UUID PRIMARY KEY,
      contract_address VARCHAR(64) NOT NULL,
      success BOOLEAN NOT NULL,
      findings JSONB NOT NULL DEFAULT '[]',
      risks JSONB NOT NULL DEFAULT '{}',
      raw_output TEXT,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_results_contract ON audit_results (contract_address);
    CREATE INDEX IF NOT EXISTS idx_audit_results_created_at ON audit_results (created_at DESC);
  `);

  console.log(`${LOG_PREFIX} Schema ready (alerts, audit_results)`);
}
