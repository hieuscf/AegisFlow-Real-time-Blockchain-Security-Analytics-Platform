import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { createLogger } from "../logging/logger";
import type { PriceUpdatePayload, SecurityAlert } from "../models/types";

const log = createLogger("websocket");
export const SECURITY_FEED_ROOM = "security-feed";

let io: Server | null = null;

export function initWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const requestedRoom = socket.handshake.query.room;
    const room =
      typeof requestedRoom === "string" && requestedRoom.trim()
        ? requestedRoom.trim()
        : SECURITY_FEED_ROOM;

    void socket.join(room);
    log.info({ socketId: socket.id, room }, "Client connected");

    socket.on("disconnect", () => {
      log.info({ socketId: socket.id }, "Client disconnected");
    });
  });

  log.info({ room: SECURITY_FEED_ROOM }, "Socket.IO ready");
  return io;
}

export function broadcastAlert(alert: SecurityAlert): void {
  if (!io) {
    return;
  }

  io.to(SECURITY_FEED_ROOM).emit("alert", alert);
  io.to(SECURITY_FEED_ROOM).emit("security-alert", alert);
}

export function broadcastPriceUpdate(payload: PriceUpdatePayload): void {
  if (!io) {
    return;
  }

  io.to(SECURITY_FEED_ROOM).emit("price-update", payload);
}

export async function closeWebSocket(): Promise<void> {
  if (!io) {
    return;
  }

  const instance = io;
  io = null;
  await instance.close();
  log.info("Socket.IO closed");
}
