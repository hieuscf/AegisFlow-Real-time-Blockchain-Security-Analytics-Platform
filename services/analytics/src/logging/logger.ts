import pino, { type Logger } from "pino";

const SERVICE_NAME = "analytics-core";

function resolveLogLevel(): string {
  const fromEnv = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (fromEnv) {
    return fromEnv;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function createRootLogger(): Logger {
  const level = resolveLogLevel();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return pino({
      level,
      base: { service: SERVICE_NAME },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  return pino({
    level,
    base: { service: SERVICE_NAME },
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  });
}

const rootLogger = createRootLogger();

/** Returns a module-scoped child logger (e.g. kafka, redis, pipeline). */
export function createLogger(module: string): Logger {
  return rootLogger.child({ module });
}

/** Logs unknown errors with stack trace in structured form. */
export function logError(
  logger: Logger,
  message: string,
  error: unknown,
): void {
  if (error instanceof Error) {
    logger.error({ err: error }, message);
    return;
  }
  logger.error({ err: new Error(String(error)) }, message);
}

export { rootLogger };
