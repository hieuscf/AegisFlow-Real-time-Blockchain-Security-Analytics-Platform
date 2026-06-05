import rateLimit from "express-rate-limit";

import type { AppConfig } from "../../config/env";

function rateLimitResponse(message: string) {
  return {
    error: message,
    code: "RATE_LIMIT_EXCEEDED",
  };
}

export function createGlobalRateLimiter(config: AppConfig) {
  const { windowMs, max } = config.rateLimit.global;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || req.path.startsWith("/health/"),
    handler: (_req, res) => {
      res.status(429).json(rateLimitResponse("Too many requests"));
    },
  });
}

export function createAuthRateLimiter(config: AppConfig) {
  const { windowMs, max } = config.rateLimit.auth;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(rateLimitResponse("Too many authentication attempts"));
    },
  });
}
