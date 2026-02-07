import type { RequestHandler } from "express";
import { InvalidParamsError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { CreateUserRequest, IUsersService, UpdateUserRequest } from "@api/users";

export function HandleCreateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as CreateUserRequest;

    const user = await service.Create(userReq);

    res.status(HttpStatus.Created).json(user);
  };
}

export function HandleUpdateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const userID = parseInt(auth?.sub);
    if (isNaN(userID)) {
      throw new InvalidParamsError({ param: "token", description: "session token must include a numeric user ID" });
    }

    const user = req.body as UpdateUserRequest;

    await service.Update(userID, user);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const userID = parseInt(auth?.sub);
    if (isNaN(userID)) {
      throw new InvalidParamsError({ param: "token", description: "session token must include a numeric user ID" });
    }

    const user = await service.Get(userID);
    res.status(HttpStatus.Ok).json(user);
  };
}
