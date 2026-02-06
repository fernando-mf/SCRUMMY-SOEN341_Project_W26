import type { RequestHandler } from "express";
import { ConflictError, InvalidParamsError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { CreateUserRequest, IUsersService, RegisterUserRequest, UpdateUserRequest } from "@api/users";

export function HandleCreateUser(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as CreateUserRequest;

    const user = await service.Create(userReq);

    res.status(HttpStatus.Created).json(user);
  };
}

export function HandleRegister(service: IUsersService): RequestHandler {
  return async (req, res) => {
    try {
      const registerReq = req.body as RegisterUserRequest;
      await service.Register(registerReq);
      res.status(HttpStatus.Created).json({ success: true });
    } catch (err) {
      console.error("Registration error:", err); // Add this line
      if (err instanceof ConflictError) {
        res.status(HttpStatus.BadRequest).json({ success: false, error: "EXISTS" });
      } else {
        res.status(HttpStatus.BadRequest).json({ success: false });
      }
    }
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
