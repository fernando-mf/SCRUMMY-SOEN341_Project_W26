import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type { IUsersService, LoginRequest } from "@api/users";


export function HandleLogin(service: IUsersService): RequestHandler {
  return async (req, res) => {
    const userReq = req.body as LoginRequest;
  
    const user = await service.Login(userReq);
    
    res.status(HttpStatus.Ok).json(user);
  };
}