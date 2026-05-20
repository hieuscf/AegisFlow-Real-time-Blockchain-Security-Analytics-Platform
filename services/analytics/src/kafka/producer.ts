import { Kafka, type Producer } from "kafkajs";

import { loadConfig } from "../config/env";
import type { SecurityAlert } from "../models/types";

const LOG_PREFIX = "[kafka-producer]";
const CLIENT_ID = "aegisflow-analytics-producer";

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
  if (producer) {
    return producer;
  }

  const config = loadConfig();
  const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: config.kafka.brokers,
    retry: { initialRetryTime: 300, retries: 8 },
  });

  producer = kafka.producer();
  await producer.connect();
  console.log(`${LOG_PREFIX} Connected`);
  return producer;
}

export async function publishSecurityAlert(alert: SecurityAlert): Promise<void> {
  const config = loadConfig();
  const instance = await getProducer();

  await instance.send({
    topic: config.kafka.securityAlertsTopic,
    messages: [
      {
        key: alert.tokenAddress ?? alert.id,
        value: JSON.stringify(alert),
      },
    ],
  });

  console.log(
    `${LOG_PREFIX} Published alert id=${alert.id} topic=${config.kafka.securityAlertsTopic}`,
  );
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (!producer) {
    return;
  }

  const instance = producer;
  producer = null;
  await instance.disconnect();
  console.log(`${LOG_PREFIX} Disconnected`);
}
