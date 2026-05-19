import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export interface AppConfig {
  kafka: {
    brokers: string[];
    groupId: string;
    topic: string;
  };
  redis: {
    url: string;
  };
}

const REQUIRED_KEYS = [
  "KAFKA_BROKERS",
  "KAFKA_GROUP_ID",
  "KAFKA_TOPIC",
  "REDIS_URL",
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

export function loadConfig(): AppConfig {
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key]?.trim()) {
      throw new Error(
        `Missing required environment variable: ${key}. ` +
          `Copy .env.example to .env and set a value.`,
      );
    }
  }

  const kafkaBrokers = parseBrokers(requireEnv("KAFKA_BROKERS"));

  return {
    kafka: {
      brokers: kafkaBrokers,
      groupId: requireEnv("KAFKA_GROUP_ID"),
      topic: requireEnv("KAFKA_TOPIC"),
    },
    redis: {
      url: requireEnv("REDIS_URL"),
    },
  };
}
