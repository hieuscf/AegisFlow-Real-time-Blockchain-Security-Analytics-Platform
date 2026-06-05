import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../errors";
import { createLogger, logError } from "../../logging/logger";

const log = createLogger("http:error");

export interface ErrorResponseBody {
  error: string;
  code: string;
  path?: string;
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorResponseBody = {
    error: "Not found",
    code: "NOT_FOUND",
    path: req.path,
  };
  res.status(404).json(body);
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    log.warn(
      { statusCode: error.statusCode, code: error.code, path: req.path },
      error.message,
    );
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    } satisfies ErrorResponseBody);
    return;
  }

  logError(log, "Unhandled request error", error);
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  } satisfies ErrorResponseBody);
}
