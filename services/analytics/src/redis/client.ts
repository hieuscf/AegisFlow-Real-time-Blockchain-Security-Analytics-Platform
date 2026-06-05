import Redis from "ioredis";

import { loadConfig } from "../config/env";
import { createLogger, logError } from "../logging/logger";

const log = createLogger("redis");
const MAX_PRICE_HISTORY = 10;

let redisClient: Redis | null = null;

function priceKey(tokenAddress: string): string {
  const normalized = tokenAddress.trim().toLowerCase();
  return `prices:${normalized}`;
}

function attachEventHandlers(client: Redis): void {
  client.on("connect", () => {
    log.info("Redis connected");
  });

  client.on("ready", () => {
    log.info("Redis ready");
  });

  client.on("close", () => {
    log.info("Redis disconnected");
  });

  client.on("reconnecting", (delayMs: number) => {
    log.warn({ delayMs }, "Redis reconnecting");
  });

  client.on("error", (error: Error) => {
    log.error({ err: error.message }, "Redis error");
  });
}

/**
 * Returns the shared Redis client singleton (creates on first call).
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const config = loadConfig();

  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times: number): number | null {
      const delay = Math.min(times * 200, 5_000);
      return delay;
    },
  });

  attachEventHandlers(redisClient);
  return redisClient;
}

/**
 * Ensures Redis is connected before processing analytics.
 */
export async function connectRedis(): Promise<Redis> {
  const client = getRedisClient();
  await client.ping();
  return client;
}

/**
 * Gracefully closes the Redis connection.
 */
export async function disconnectRedis(): Promise<void> {
  if (!redisClient) {
    return;
  }

  const client = redisClient;
  redisClient = null;
  await client.quit();
}

/**
 * Stores the latest price for a token (newest first, max 10 entries).
 */
export async function pushTokenPrice(
  tokenAddress: string,
  price: number,
): Promise<void> {
  if (!tokenAddress.trim()) {
    log.warn("pushTokenPrice skipped: empty token address");
    return;
  }

  if (!Number.isFinite(price) || Number.isNaN(price) || price < 0) {
    log.warn({ tokenAddress, price }, "pushTokenPrice skipped: invalid price");
    return;
  }

  const key = priceKey(tokenAddress);

  try {
    const client = getRedisClient();
    await client
      .multi()
      .lpush(key, String(price))
      .ltrim(key, 0, MAX_PRICE_HISTORY - 1)
      .exec();

    log.debug({ tokenAddress, price }, "Pushed price");
  } catch (error) {
    logError(log, `pushTokenPrice failed token=${tokenAddress}`, error);
    throw error;
  }
}

/**
 * Returns up to 10 stored prices for a token (newest first).
 */
export async function getTokenPrices(tokenAddress: string): Promise<number[]> {
  if (!tokenAddress.trim()) {
    return [];
  }

  const key = priceKey(tokenAddress);

  try {
    const client = getRedisClient();
    const rawValues = await client.lrange(key, 0, MAX_PRICE_HISTORY - 1);

    const prices: number[] = [];

    for (const raw of rawValues) {
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed >= 0) {
        prices.push(parsed);
      }
    }

    return prices;
  } catch (error) {
    logError(log, `getTokenPrices failed token=${tokenAddress}`, error);
    return [];
  }
}
