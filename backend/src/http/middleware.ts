import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AppError, AuthenticationError, InternalError } from "@api/helpers/errors";
import { AuthInfoToRequest } from "@api/helpers/http";
import { verifyToken } from "@api/helpers/jwt";

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

export function RequireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AuthenticationError("missing token");
  }

  const token = header.substring(7);

  try {
    const payload = verifyToken(token);
    AuthInfoToRequest(req, payload);

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AuthenticationError("token expired");
    }

    if (err instanceof JsonWebTokenError) {
      throw new AuthenticationError("invalid token");
    }

    throw err;
  }
}
