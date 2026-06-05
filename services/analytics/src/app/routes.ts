import { Router } from "express";

import { buildSiweMessage, verifySiweSignature } from "../auth/siwe";
import { signSessionToken } from "../auth/jwt";
import { issueNonce } from "../auth/nonce";
import { loadConfig } from "../config/env";
import { BadRequestError } from "./errors";
import { asyncHandler } from "./middleware/asyncHandler";
import {
  createAuthRateLimiter,
} from "./middleware/rateLimit";
import { createHealthRouter } from "./routes/health";
import { createNotificationsRouter } from "./routes/notifications";

export function createApiRouter(): Router {
  const router = Router();
  const config = loadConfig();
  const authLimiter = createAuthRateLimiter(config);

  router.use(createHealthRouter());
  router.use(createNotificationsRouter());

  router.get(
    "/api/auth/nonce",
    authLimiter,
    asyncHandler(async (req, res) => {
      const address = String(req.query.address ?? "").trim();
      if (!address) {
        throw new BadRequestError("address query parameter is required");
      }

      const nonce = await issueNonce(address);
      const message = buildSiweMessage(address, nonce);

      res.json({ nonce, message, address });
    }),
  );

  router.post(
    "/api/auth/verify",
    authLimiter,
    asyncHandler(async (req, res) => {
      const message = String(req.body?.message ?? "").trim();
      const signature = String(req.body?.signature ?? "").trim();

      if (!message || !signature) {
        throw new BadRequestError("message and signature are required");
      }

      const { address } = await verifySiweSignature(message, signature);
      const token = signSessionToken(address);

      res.json({ token, address });
    }),
  );

  return router;
}
