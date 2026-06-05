import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";

import { processSwapAnalytics } from "../analytics/pipeline";
import { loadConfig } from "../config/env";
import { createLogger, logError } from "../logging/logger";
import type { SwapEvent } from "../models/types";

const log = createLogger("kafka");
const CLIENT_ID = "aegisflow-analytics-core";

let kafkaConsumer: SwapKafkaConsumer | null = null;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isValidAmountString(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }

  try {
    return BigInt(trimmed) >= 0n;
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes a raw Kafka payload into a SwapEvent.
 */
export function validateSwapEvent(data: unknown): SwapEvent | null {
  if (data === null || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (
    !isNonEmptyString(record.txHash) ||
    !isNonEmptyString(record.pairAddress) ||
    !isNonEmptyString(record.token0) ||
    !isNonEmptyString(record.token1) ||
    !isNonEmptyString(record.sender) ||
    !isValidAmountString(record.amount0In) ||
    !isValidAmountString(record.amount1In) ||
    !isValidAmountString(record.amount0Out) ||
    !isValidAmountString(record.amount1Out) ||
    !isNonNegativeInteger(record.blockNumber) ||
    !isNonNegativeInteger(record.timestamp)
  ) {
    return null;
  }

  const amount0In = record.amount0In as string;
  const amount1In = record.amount1In as string;
  const amount0Out = record.amount0Out as string;
  const amount1Out = record.amount1Out as string;

  return {
    txHash: (record.txHash as string).trim(),
    pairAddress: (record.pairAddress as string).trim(),
    token0: (record.token0 as string).trim(),
    token1: (record.token1 as string).trim(),
    sender: (record.sender as string).trim(),
    amount0In: amount0In.trim(),
    amount1In: amount1In.trim(),
    amount0Out: amount0Out.trim(),
    amount1Out: amount1Out.trim(),
    blockNumber: record.blockNumber as number,
    timestamp: record.timestamp as number,
  };
}

async function processSwapMessage(
  payload: EachMessagePayload,
): Promise<void> {
  const raw = payload.message.value?.toString("utf8");

  if (!raw) {
    log.warn("Skipping empty message");
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    log.warn("Invalid JSON, skipping message");
    return;
  }

  const swap = validateSwapEvent(parsed);
  if (!swap) {
    log.warn("Malformed SwapEvent, skipping message");
    return;
  }

  await processSwapAnalytics(swap);

  log.debug(
    { txHash: swap.txHash, pairAddress: swap.pairAddress },
    "Message processed",
  );
}

class SwapKafkaConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private isRunning = false;

  constructor() {
    const config = loadConfig();

    this.kafka = new Kafka({
      clientId: CLIENT_ID,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
    });
  }

  async start(): Promise<void> {
    const config = loadConfig();

    this.consumer.on(this.consumer.events.CONNECT, () => {
      log.info("Kafka connected");
    });

    this.consumer.on(this.consumer.events.DISCONNECT, () => {
      log.warn("Kafka disconnected (client will retry)");
    });

    this.consumer.on(this.consumer.events.CRASH, (event) => {
      log.error(
        { err: event.payload.error.message },
        "Consumer crash",
      );
    });

    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: config.kafka.topic,
      fromBeginning: false,
    });

    this.isRunning = true;

    void this.consumer
      .run({
        autoCommit: true,
        eachMessage: async (messagePayload) => {
          if (!this.isRunning) {
            return;
          }

          try {
            await processSwapMessage(messagePayload);
          } catch (error) {
            logError(log, "Message processing error", error);
          }
        },
      })
      .catch((error: unknown) => {
        logError(log, "Consumer run loop failed", error);
      });

    log.info(
      { groupId: config.kafka.groupId, topic: config.kafka.topic },
      "Consumer started",
    );
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    try {
      await this.consumer.stop();
    } catch (error) {
      logError(log, "Consumer stop warning", error);
    }

    try {
      await this.consumer.disconnect();
      log.info("Kafka disconnected");
    } catch (error) {
      logError(log, "Consumer disconnect warning", error);
    }
  }
}

/**
 * Starts the Kafka consumer for market-swaps.
 */
export async function startKafkaConsumer(): Promise<void> {
  if (kafkaConsumer) {
    return;
  }

  kafkaConsumer = new SwapKafkaConsumer();
  await kafkaConsumer.start();
}

/**
 * Gracefully stops the Kafka consumer.
 */
export async function stopKafkaConsumer(): Promise<void> {
  if (!kafkaConsumer) {
    return;
  }

  const instance = kafkaConsumer;
  kafkaConsumer = null;
  await instance.stop();
}
