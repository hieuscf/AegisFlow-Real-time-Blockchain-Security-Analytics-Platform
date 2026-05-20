import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import type { PriceUpdatePayload, SecurityAlert } from "../models/types";

const LOG_PREFIX = "[websocket]";
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
    console.log(`${LOG_PREFIX} Client connected id=${socket.id} room=${room}`);

    socket.on("disconnect", () => {
      console.log(`${LOG_PREFIX} Client disconnected id=${socket.id}`);
    });
  });

  console.log(`${LOG_PREFIX} Socket.IO ready room=${SECURITY_FEED_ROOM}`);
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
  console.log(`${LOG_PREFIX} Socket.IO closed`);
}
