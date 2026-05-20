import cors from "cors";
import express from "express";
import http from "node:http";

import { loadConfig } from "../config/env";
import { initWebSocket } from "../websocket/hub";
import { createApiRouter } from "./routes";

export interface HttpApplication {
  app: express.Application;
  server: http.Server;
}

export function createHttpApplication(): HttpApplication {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(createApiRouter());

  const server = http.createServer(app);
  initWebSocket(server);

  const config = loadConfig();
  console.log(`[http] API + Socket.IO will listen on port ${config.port}`);

  return { app, server };
}

export function startHttpServer(server: http.Server): Promise<void> {
  const config = loadConfig();

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, () => {
      console.log(`[http] Listening on http://localhost:${config.port}`);
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
