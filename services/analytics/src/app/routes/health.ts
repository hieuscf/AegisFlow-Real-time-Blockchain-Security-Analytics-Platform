import { Router } from "express";

import { isPostgresAvailable } from "../../database/availability";
import { getRedisClient } from "../../redis/client";
import { asyncHandler } from "../middleware/asyncHandler";

export function createHealthRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "analytics-core",
      timestamp: new Date().toISOString(),
    });
  });

  router.get(
    "/health/ready",
    asyncHandler(async (_req, res) => {
      let redisOk = false;

      try {
        const redis = getRedisClient();
        const pong = await redis.ping();
        redisOk = pong === "PONG";
      } catch {
        redisOk = false;
      }

      const postgresOk = isPostgresAvailable();
      const ready = redisOk;

      res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "degraded",
        service: "analytics-core",
        timestamp: new Date().toISOString(),
        checks: {
          redis: redisOk,
          postgres: postgresOk,
        },
      });
    }),
  );

  return router;
}
