import { Kafka, type Producer } from "kafkajs";

import { validateSwapEvent } from "../kafka/consumer";
import { createLogger, logError } from "../logging/logger";
import type { SwapEvent } from "../models/types";
import type { MockConfig } from "./config";

const log = createLogger("mock");
const CLIENT_ID = "aegisflow-mock-data";
const MAX_SEND_RETRIES = 5;
const RETRY_DELAY_MS = 500;

export class MockKafkaProducer {
  private readonly kafka: Kafka;
  private producer: Producer | null = null;

  constructor(private readonly config: MockConfig) {
    this.kafka = new Kafka({
      clientId: CLIENT_ID,
      brokers: config.kafkaBrokers,
      retry: { initialRetryTime: 300, retries: 8 },
    });
  }

  async connect(): Promise<void> {
    if (this.producer) {
      return;
    }

    this.producer = this.kafka.producer();
    await this.producer.connect();
    log.info("Kafka connected");
  }

  async publishSwap(swap: SwapEvent): Promise<void> {
    const validated = validateSwapEvent(swap);
    if (!validated) {
      throw new Error("Generated swap failed validateSwapEvent — schema mismatch");
    }

    const producer = this.producer;
    if (!producer) {
      throw new Error("Kafka producer not connected");
    }

    const payload = JSON.stringify(validated);

    for (let attempt = 1; attempt <= MAX_SEND_RETRIES; attempt += 1) {
      try {
        await producer.send({
          topic: this.config.kafkaTopic,
          messages: [
            {
              key: validated.pairAddress,
              value: payload,
            },
          ],
        });
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (attempt >= MAX_SEND_RETRIES) {
          throw new Error(
            `Failed to publish swap after ${MAX_SEND_RETRIES} attempts: ${message}`,
          );
        }
        log.warn(
          { attempt, maxRetries: MAX_SEND_RETRIES, err: message },
          "Publish retry",
        );
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (!this.producer) {
      return;
    }

    const instance = this.producer;
    this.producer = null;
    await instance.disconnect();
    log.info("Kafka disconnected");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
