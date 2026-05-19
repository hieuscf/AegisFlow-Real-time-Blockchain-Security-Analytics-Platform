import { loadConfig } from "./config/env";
import { connectRedis, disconnectRedis } from "./redis/client";

const SHUTDOWN_TIMEOUT_MS = 10_000;

let isShuttingDown = false;

async function logStartup(): Promise<void> {
  const config = loadConfig();

  console.log("[analytics-core] Starting AegisFlow Analytics Core");
  console.log(
    `[analytics-core] Kafka brokers=${config.kafka.brokers.join(",")} ` +
      `group=${config.kafka.groupId} topic=${config.kafka.topic}`,
  );
  console.log(`[analytics-core] Redis url=${config.redis.url}`);

  await connectRedis();

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
    await disconnectRedis();
    console.log("[analytics-core] Cleanup complete");
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
