import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type { CreateUserRequest, IUsersService, LoginRequest } from "@api/users";

export function HandleLogin(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as LoginRequest;

    const user = await service.Login(userReq);

    res.status(HttpStatus.Ok).json(user);
  };
}

export function HandleCreateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as CreateUserRequest;

    const user = await service.Create(userReq);

    res.status(HttpStatus.Created).json(user);
  };
}
