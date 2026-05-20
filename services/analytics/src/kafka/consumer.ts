import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";

import { processSwapAnalytics } from "../analytics/pipeline";
import { loadConfig } from "../config/env";
import type { SwapEvent } from "../models/types";

const LOG_PREFIX = "[kafka]";
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
    console.warn(`${LOG_PREFIX} Skipping empty message`);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    console.warn(`${LOG_PREFIX} Invalid JSON, skipping message`);
    return;
  }

  const swap = validateSwapEvent(parsed);
  if (!swap) {
    console.warn(`${LOG_PREFIX} Malformed SwapEvent, skipping message`);
    return;
  }

  await processSwapAnalytics(swap);

  console.log(
    `${LOG_PREFIX} Message processed tx=${swap.txHash} pair=${swap.pairAddress}`,
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
      console.log(`${LOG_PREFIX} Kafka connected`);
    });

    this.consumer.on(this.consumer.events.DISCONNECT, () => {
      console.log(`${LOG_PREFIX} Kafka disconnected (client will retry)`);
    });

    this.consumer.on(this.consumer.events.CRASH, (event) => {
      console.error(
        `${LOG_PREFIX} Consumer crash: ${event.payload.error.message}`,
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
            const message =
              error instanceof Error ? error.message : String(error);
            console.error(`${LOG_PREFIX} Message processing error: ${message}`);
          }
        },
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`${LOG_PREFIX} Consumer run loop failed: ${message}`);
      });

    console.log(
      `${LOG_PREFIX} Consumer started group=${config.kafka.groupId} topic=${config.kafka.topic}`,
    );
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    try {
      await this.consumer.stop();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${LOG_PREFIX} Consumer stop warning: ${message}`);
    }

    try {
      await this.consumer.disconnect();
      console.log(`${LOG_PREFIX} Kafka disconnected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${LOG_PREFIX} Consumer disconnect warning: ${message}`);
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
