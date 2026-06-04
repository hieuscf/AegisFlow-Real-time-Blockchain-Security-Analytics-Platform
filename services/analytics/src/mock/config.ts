import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export interface MockConfig {
  kafkaBrokers: string[];
  kafkaTopic: string;
  swapIntervalMs: number;
  crashIntervalMs: number;
  initialPriceUsd: number;
}

const REQUIRED_KEYS = ["KAFKA_BROKERS"] as const;

function requireEnv(key: (typeof REQUIRED_KEYS)[number]): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env (same as analytics service).`,
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
    throw new Error("KAFKA_BROKERS must contain at least one broker.");
  }

  return brokers;
}

function parsePositiveInt(raw: string, fallback: number): number {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveFloat(raw: string, fallback: number): number {
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadMockConfig(): MockConfig {
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing required environment variable: ${key}.`);
    }
  }

  return {
    kafkaBrokers: parseBrokers(requireEnv("KAFKA_BROKERS")),
    kafkaTopic: optionalEnv("KAFKA_TOPIC", "market-swaps"),
    swapIntervalMs: parsePositiveInt(
      optionalEnv("MOCK_SWAP_INTERVAL_MS", "3000"),
      3000,
    ),
    crashIntervalMs: parsePositiveInt(
      optionalEnv("MOCK_CRASH_INTERVAL_MS", "15000"),
      15_000,
    ),
    initialPriceUsd: parsePositiveFloat(
      optionalEnv("MOCK_INITIAL_PRICE", "100"),
      100,
    ),
  };
}
