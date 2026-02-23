import type { RequestHandler } from "express";
import { AuthenticationError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { IUsersService, UpdateUserRequest } from "@api/users";

export function HandleUpdateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const userId = parseInt(auth?.sub);
    if (isNaN(userId)) {
      throw new AuthenticationError("invalid token");
    }

    const user = req.body as UpdateUserRequest;

    await service.Update(userId, user);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const userId = parseInt(auth?.sub);
    if (isNaN(userId)) {
      throw new AuthenticationError("invalid token");
    }

    const user = await service.Get(userId);
    res.status(HttpStatus.Ok).json(user);
  };
}
