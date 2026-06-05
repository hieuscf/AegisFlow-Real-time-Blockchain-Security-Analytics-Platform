export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code ?? httpErrorCode(statusCode);
  }
}

function httpErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 429:
      return "RATE_LIMIT_EXCEEDED";
    default:
      return "HTTP_ERROR";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, code = "BAD_REQUEST") {
    super(400, message, code);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, code = "NOT_FOUND") {
    super(404, message, code);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, code = "UNAUTHORIZED") {
    super(401, message, code);
  }
}
