import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export interface AppConfig {
  port: number;
  kafka: {
    brokers: string[];
    groupId: string;
    topic: string;
    securityAlertsTopic: string;
  };
  redis: {
    url: string;
  };
  postgres: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  siwe: {
    domain: string;
    uri: string;
    nonceTtlSeconds: number;
  };
  anomaly: {
    dropThreshold: number;
  };
  audit: {
    enabled: boolean;
    command: string;
    maxConcurrent: number;
    timeoutMs: number;
  };
  alerts: {
    dedupeTtlSeconds: number;
  };
}

const REQUIRED_KEYS = [
  "KAFKA_BROKERS",
  "KAFKA_GROUP_ID",
  "KAFKA_TOPIC",
  "REDIS_URL",
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

function requireEnv(key: (typeof REQUIRED_KEYS)[number]): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env and set a value.`,
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

function parseBrokers(raw: string): string[] {
  const brokers = raw
    .split(",")
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (brokers.length === 0) {
    throw new Error(
      "KAFKA_BROKERS must contain at least one broker (e.g. localhost:9092).",
    );
  }

  return brokers;
}

function parsePositiveInt(raw: string, fallback: number): number {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseThreshold(raw: string, fallback: number): number {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) {
    return fallback;
  }
  return parsed;
}

export function loadConfig(): AppConfig {
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key]?.trim()) {
      throw new Error(
        `Missing required environment variable: ${key}. ` +
          `Copy .env.example to .env and set a value.`,
      );
    }
  }

  return {
    port: parsePositiveInt(optionalEnv("PORT", "8080"), 8080),
    kafka: {
      brokers: parseBrokers(requireEnv("KAFKA_BROKERS")),
      groupId: requireEnv("KAFKA_GROUP_ID"),
      topic: requireEnv("KAFKA_TOPIC"),
      securityAlertsTopic: optionalEnv(
        "KAFKA_SECURITY_ALERTS_TOPIC",
        "security-alerts",
      ),
    },
    redis: {
      url: requireEnv("REDIS_URL"),
    },
    postgres: {
      url: requireEnv("DATABASE_URL"),
    },
    jwt: {
      secret: requireEnv("JWT_SECRET"),
      expiresIn: optionalEnv("JWT_EXPIRES_IN", "24h"),
    },
    siwe: {
      domain: optionalEnv("SIWE_DOMAIN", "localhost"),
      uri: optionalEnv("SIWE_URI", "http://localhost:8080"),
      nonceTtlSeconds: parsePositiveInt(
        optionalEnv("SIWE_NONCE_TTL_SECONDS", "300"),
        300,
      ),
    },
    anomaly: {
      dropThreshold: parseThreshold(
        optionalEnv("ANOMALY_DROP_THRESHOLD", "0.5"),
        0.5,
      ),
    },
    audit: {
      enabled: optionalEnv("SLITHER_ENABLED", "false") === "true",
      command: optionalEnv("SLITHER_COMMAND", "slither"),
      maxConcurrent: parsePositiveInt(
        optionalEnv("MAX_CONCURRENT_AUDITS", "2"),
        2,
      ),
      timeoutMs: parsePositiveInt(
        optionalEnv("SLITHER_TIMEOUT_MS", "120000"),
        120_000,
      ),
    },
    alerts: {
      dedupeTtlSeconds: parsePositiveInt(
        optionalEnv("ALERT_DEDUPE_TTL_SECONDS", "60"),
        60,
      ),
    },
  };
}
