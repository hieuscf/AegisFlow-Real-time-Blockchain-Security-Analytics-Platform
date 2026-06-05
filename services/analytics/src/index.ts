import { registerAlertHandler } from "./alerts/engine";
import { setPostgresAvailable } from "./database/availability";
import { createLogger, logError } from "./logging/logger";
import { pushNotification } from "./notifications/store";
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

const log = createLogger("core");
const SHUTDOWN_TIMEOUT_MS = 20_000;

let isShuttingDown = false;
let httpServer: ReturnType<typeof createHttpApplication>["server"] | null = null;

function registerAlertHandlers(): void {
  registerAlertHandler(async (alert) => {
    pushNotification(alert);
    broadcastAlert(alert);
  });
}

async function logStartup(): Promise<void> {
  const config = loadConfig();

  log.info("Starting AegisFlow Analytics Core");
  log.info(
    {
      brokers: config.kafka.brokers,
      groupId: config.kafka.groupId,
      topic: config.kafka.topic,
      alertsTopic: config.kafka.securityAlertsTopic,
      redisUrl: config.redis.url,
      port: config.port,
    },
    "Service configuration loaded",
  );

  registerAlertHandlers();

  const httpApp = createHttpApplication();
  httpServer = httpApp.server;

  await connectRedis();

  try {
    await connectPostgres();
    await initSchema();
    setPostgresAvailable(true);
    log.info("Postgres connected");
  } catch (error) {
    setPostgresAvailable(false);
    log.warn(
      { err: error instanceof Error ? error.message : String(error) },
      "Postgres unavailable — alerts will not be persisted",
    );
  }

  await startHttpServer(httpServer);
  await startKafkaConsumer();

  log.info("Service ready");
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  log.info({ signal }, "Shutting down");

  const forceExitTimer = setTimeout(() => {
    log.error("Shutdown timeout exceeded, forcing exit");
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
    log.info("Shutdown complete");
  } catch (error) {
    logError(log, "Shutdown error", error);
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
    logError(log, "Uncaught exception", error);
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logError(log, "Unhandled rejection", reason);
    void shutdown("unhandledRejection");
  });
}

async function main(): Promise<void> {
  registerSignalHandlers();

  try {
    await logStartup();
  } catch (error) {
    logError(log, "Startup failed", error);
    process.exit(1);
  }
}

void main();
