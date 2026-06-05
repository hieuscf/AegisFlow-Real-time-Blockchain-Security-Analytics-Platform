import cors from "cors";
import express from "express";
import http from "node:http";

import { loadConfig } from "../config/env";
import { createLogger } from "../logging/logger";
import { initWebSocket } from "../websocket/hub";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createGlobalRateLimiter } from "./middleware/rateLimit";
import { createApiRouter } from "./routes";

const log = createLogger("http");

export interface HttpApplication {
  app: express.Application;
  server: http.Server;
}

export function createHttpApplication(): HttpApplication {
  const app = express();
  const config = loadConfig();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(createGlobalRateLimiter(config));
  app.use(createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = http.createServer(app);
  initWebSocket(server);

  log.info({ port: config.port }, "API + Socket.IO will listen");

  return { app, server };
}

export function startHttpServer(server: http.Server): Promise<void> {
  const config = loadConfig();

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, () => {
      log.info({ port: config.port }, "Listening");
      resolve();
    });
  });
}

export function stopHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
