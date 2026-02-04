import type { RequestHandler } from "express";
import { InvalidParamsError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { CreateUserRequest, IUsersService, UpdateUserRequest } from "@api/users";

export function HandleCreateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as CreateUserRequest;

    const user = await service.Create(userReq);

    const { passwordHash, ...publicUser } = user; //public version without password. Should add for other handlers?

    res.status(HttpStatus.Created).json(publicUser);
  };
}

export function HandleUpdateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userID = parseInt(req.params.id);
    if (isNaN(userID)) {
      throw new InvalidParamsError({ param: "id", description: "user ID must be a number" });
    }

    const user = req.body as UpdateUserRequest;

    await service.Update(userID, user);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userID = parseInt(req.params.id);
    if (isNaN(userID)) {
      throw new InvalidParamsError({ param: "id", description: "user ID must be a number" });
    }

    const user = await service.Get(userID);

    res.status(HttpStatus.Ok).json(user);
  };
}
