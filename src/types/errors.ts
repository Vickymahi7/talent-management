import { HttpStatusCode } from "../types/enums";

class ApiError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "Error";
    Error.captureStackTrace(this, ApiError);
  }
}

class HttpBadRequest extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
    this.name = "BadRequest";
  }
}

class HttpUnauthorized extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.UNAUTHORIZED);
    this.name = "Unauthorized";
  }
}

class HttpForbidden extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.FORBIDDEN);
    this.name = "Forbidden";
  }
}

class HttpNotFound extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.NOT_FOUND);
    this.name = "NotFound";
  }
}

class HttpConflict extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.CONFLICT);
    this.name = "Conflict";
  }
}

class HttpInternalServerError extends ApiError {
  constructor(message: string) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR);
    this.name = "HttpInternalServerError";
  }
}

export {
  ApiError,
  HttpBadRequest,
  HttpUnauthorized,
  HttpForbidden,
  HttpNotFound,
  HttpConflict,
  HttpInternalServerError,
};
