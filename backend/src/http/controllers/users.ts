import type { RequestHandler } from "express";
import { HttpStatus, UserIDFromRequest } from "@api/helpers/http";
import type { IUsersService, UpdateUserRequest } from "@api/users";

export function HandleUpdateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userId = UserIDFromRequest(req);

    const user = req.body as UpdateUserRequest;

    await service.Update(userId, user);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userId = UserIDFromRequest(req);

    const user = await service.Get(userId);
    res.status(HttpStatus.Ok).json(user);
  };
}
