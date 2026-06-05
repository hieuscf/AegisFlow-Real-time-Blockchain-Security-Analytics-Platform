import { Router, type Request, type Response } from "express";

import { createLogger, logError } from "../../logging/logger";
import {
  getNotification,
  getNotificationStats,
  listNotifications,
} from "../../notifications/service";
import {
  parseNotificationIdParam,
  parseNotificationListQuery,
} from "../../notifications/query";

const log = createLogger("api:notifications");

function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response) => void {
  return (req, res) => {
    void handler(req, res).catch((error: unknown) => {
      logError(log, "Request failed", error);
      res.status(500).json({ error: "Internal server error" });
    });
  };
}

export function createNotificationsRouter(): Router {
  const router = Router();

  router.get(
    "/api/notifications",
    asyncHandler(async (req, res) => {
      const query = parseNotificationListQuery(req);
      const result = await listNotifications(query);
      res.json(result);
    }),
  );

  router.get(
    "/api/notifications/stats",
    asyncHandler(async (_req, res) => {
      const stats = await getNotificationStats();
      res.json(stats);
    }),
  );

  router.get(
    "/api/notifications/:id",
    asyncHandler(async (req, res) => {
      const id = parseNotificationIdParam(req.params.id ?? "");
      if (!id) {
        res.status(400).json({ error: "Invalid notification id" });
        return;
      }

      const result = await getNotification(id);
      if (!result) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      res.json({
        data: result.notification,
        meta: { source: result.source },
      });
    }),
  );

  /** @deprecated Use GET /api/notifications */
  router.get(
    "/api/alerts",
    asyncHandler(async (req, res) => {
      const query = parseNotificationListQuery(req);
      const result = await listNotifications(query);
      res.json({ data: result.data, meta: result.meta });
    }),
  );

  return router;
}
