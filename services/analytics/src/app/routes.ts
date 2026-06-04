import { Router, type Request, type Response } from "express";

import { buildSiweMessage, verifySiweSignature } from "../auth/siwe";
import { signSessionToken } from "../auth/jwt";
import { issueNonce } from "../auth/nonce";
import { createNotificationsRouter } from "./routes/notifications";

function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response) => void {
  return (req, res) => {
    void handler(req, res).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[api] Request failed:", message);
      res.status(500).json({ error: "Internal server error" });
    });
  };
}

export function createApiRouter(): Router {
  const router = Router();

  router.use(createNotificationsRouter());

  router.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "analytics-core" });
  });

  router.get(
    "/api/auth/nonce",
    asyncHandler(async (req, res) => {
      const address = String(req.query.address ?? "").trim();
      if (!address) {
        res.status(400).json({ error: "address query parameter is required" });
        return;
      }

      const nonce = await issueNonce(address);
      const message = buildSiweMessage(address, nonce);

      res.json({ nonce, message, address });
    }),
  );

  router.post(
    "/api/auth/verify",
    asyncHandler(async (req, res) => {
      const message = String(req.body?.message ?? "").trim();
      const signature = String(req.body?.signature ?? "").trim();

      if (!message || !signature) {
        res.status(400).json({ error: "message and signature are required" });
        return;
      }

      const { address } = await verifySiweSignature(message, signature);
      const token = signSessionToken(address);

      res.json({ token, address });
    }),
  );

  return router;
}
