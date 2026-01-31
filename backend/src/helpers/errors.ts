export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract GetMeta(): Record<string, unknown>;
}

export class NotFoundError extends AppError {
  statusCode = 404;
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
  statusCode = 500;
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
