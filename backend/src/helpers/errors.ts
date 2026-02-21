import { ZodError } from "zod";
import { HttpStatus } from "./http";

export abstract class AppError extends Error {
  // statusCode is the HTTP status code to return
  abstract statusCode: HttpStatus;

  // code is a small description of the error, included in the response body
  abstract code: string;

  // GetMeta returns the error metadata, included in the response body
  abstract GetMeta(): Record<string, unknown>;
}

export class NotFoundError extends AppError {
  statusCode = HttpStatus.NotFound;
  code = "not_found";

  constructor(private entity: string) {
    super(`not found: ${entity}`);
  }

  GetMeta(): Record<string, unknown> {
    return {
      entity: this.entity,
    };
  }
}

export class InternalError extends AppError {
  statusCode = HttpStatus.InternalServerError;
  code = "internal";

  constructor(private err: string) {
    super(`internal: ${err}`);
  }

  GetMeta(): Record<string, unknown> {
    return {
      message: this.err,
    };
  }
}

type paramWithDescription = {
  param: string;
  description: string;
};

export class ConflictError extends AppError {
  statusCode = HttpStatus.Conflict;
  code = "conflict";

  constructor(private err: string) {
    super(`conflict: ${err}`);
  }

  GetMeta(): Record<string, unknown> {
    return {
      message: this.err,
    };
  }
}

export class AuthenticationError extends AppError {
  statusCode = HttpStatus.Unauthorized;
  code = "authentication_failed";

  constructor(private err: string) {
    super(`authentication: ${err}`);
  }

  GetMeta(): Record<string, unknown> {
    return {
      message: this.err,
    };
  }
}

export class ForbiddenError extends AppError {
  statusCode = HttpStatus.Forbidden;
  code = "forbidden";

  constructor(private err: string) {
    super(`forbidden: ${err}`);
  }

  GetMeta(): Record<string, unknown> {
    return {
      message: this.err,
    };
  }
}

export class InvalidParamsError extends AppError {
  statusCode = HttpStatus.BadRequest;
  code = "invalid_params";

  private params: Record<string, string>;

  constructor(...params: paramWithDescription[]) {
    const keys = params.map((p) => p.param);
    super(`invalid params: ${keys.join(", ")}`);

    this.params = params.reduce(
      (acc, p) => ({
        ...acc,
        [p.param]: p.description,
      }),
      {},
    );
  }

  static FromZodError(zodError: ZodError): InvalidParamsError {
    const params: paramWithDescription[] = zodError.issues.map((issue) => ({
      param: issue.path.join("."),
      description: issue.message,
    }));

    return new InvalidParamsError(...params);
  }

  GetMeta(): Record<string, unknown> {
    return {
      params: this.params,
    };
  }
}
