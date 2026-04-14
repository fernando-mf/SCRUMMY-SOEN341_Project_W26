import { Request } from "express";
import { z } from "zod";
import { AuthenticationError, InternalError } from "./errors";

export enum HttpStatus {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

// same payload defined in `UsersService.Login/Create`
const authInfoSchema = z.object({
  sub: z.coerce.number().int(),
  email: z.string(),
});
type authInfo = z.infer<typeof authInfoSchema>;

export function AuthInfoToRequest(req: Request, authInfo: unknown) {
  const validation = authInfoSchema.safeParse(authInfo);
  if (validation.error) {
    throw new InternalError("invalid token payload provided");
  }

  // eslint-disable-next-line
  (req as Record<string, any>).auth = validation.data;
}

export function AuthInfoFromRequest(req: Request): authInfo {
  if (!("auth" in req)) {
    throw new AuthenticationError("missing auth details in request");
  }

  const validation = authInfoSchema.safeParse(req.auth);
  if (validation.error) {
    throw new AuthenticationError("invalid token");
  }

  return validation.data;
}

export function UserIDFromRequest(req: Request): number {
  return AuthInfoFromRequest(req).sub;
}
