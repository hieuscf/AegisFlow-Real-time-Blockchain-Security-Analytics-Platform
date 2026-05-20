import { registerAlertHandler } from "./alerts/engine";
import {
  createHttpApplication,
  startHttpServer,
  stopHttpServer,
} from "./app/server";
import { loadConfig } from "./config/env";
import {
  connectPostgres,
  disconnectPostgres,
  initSchema,
} from "./database/client";
import { startKafkaConsumer, stopKafkaConsumer } from "./kafka/consumer";
import { disconnectKafkaProducer } from "./kafka/producer";
import { connectRedis, disconnectRedis } from "./redis/client";
import { broadcastAlert, closeWebSocket } from "./websocket/hub";

const SHUTDOWN_TIMEOUT_MS = 20_000;

let isShuttingDown = false;
let httpServer: ReturnType<typeof createHttpApplication>["server"] | null = null;

function registerAlertBroadcast(): void {
  registerAlertHandler(async (alert) => {
    broadcastAlert(alert);
  });
}

async function logStartup(): Promise<void> {
  const config = loadConfig();

  console.log("[analytics-core] Starting AegisFlow Analytics Core");
  console.log(
    `[analytics-core] Kafka brokers=${config.kafka.brokers.join(",")} ` +
      `group=${config.kafka.groupId} topic=${config.kafka.topic}`,
  );
  console.log(
    `[analytics-core] Kafka alerts topic=${config.kafka.securityAlertsTopic}`,
  );
  console.log(`[analytics-core] Redis url=${config.redis.url}`);
  console.log(`[analytics-core] Postgres configured`);
  console.log(`[analytics-core] HTTP port=${config.port}`);

  registerAlertBroadcast();

  const httpApp = createHttpApplication();
  httpServer = httpApp.server;

  await connectRedis();
  await connectPostgres();
  await initSchema();
  await startHttpServer(httpServer);
  await startKafkaConsumer();

  console.log("[analytics-core] Service ready");
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`[analytics-core] Received ${signal}, shutting down...`);

  const forceExitTimer = setTimeout(() => {
    console.error("[analytics-core] Shutdown timeout exceeded, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    await stopKafkaConsumer();
    await disconnectKafkaProducer();
    await closeWebSocket();

    if (httpServer) {
      await stopHttpServer(httpServer);
      httpServer = null;
    }

    await disconnectRedis();
    await disconnectPostgres();
    console.log("[analytics-core] Shutdown complete");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[analytics-core] Shutdown error:", message);
  } finally {
    clearTimeout(forceExitTimer);
    process.exit(0);
  }
}

function registerSignalHandlers(): void {
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("uncaughtException", (error: Error) => {
    console.error("[analytics-core] Uncaught exception:", error);
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    console.error("[analytics-core] Unhandled rejection:", reason);
    void shutdown("unhandledRejection");
  });
}

async function main(): Promise<void> {
  registerSignalHandlers();

  try {
    await logStartup();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[analytics-core] Startup failed:", message);
    process.exit(1);
  }
}

void main();
