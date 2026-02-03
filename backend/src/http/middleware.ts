import type { NextFunction, Request, Response } from "express";
import { AppError, InternalError } from "@api/helpers/errors";

export function ErrorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  let appErr: AppError;
  if (err instanceof AppError) {
    appErr = err;
  } else {
    appErr = new InternalError(err.message);
  }

  res.status(appErr.statusCode).json({
    code: appErr.code,
    ...appErr.GetMeta(),
  });
}
