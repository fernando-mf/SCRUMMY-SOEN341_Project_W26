import type { RequestHandler } from "express";
import type { IUsersService, UpdateUserRequest } from "@api/users";

export function HandleUpdateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userID = parseInt(req.params.id);
    const user = req.body as UpdateUserRequest;

    await service.Update(userID, user);

    res.status(201).send();
  };
}

export function HandleGetUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userID = parseInt(req.params.id);

    const user = await service.Get(userID);

    res.status(200).json(user);
  };
}
