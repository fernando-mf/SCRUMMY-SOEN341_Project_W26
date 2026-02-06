
import { Body, Controller, Post, Get, Path, Put, Route, SuccessResponse, Response, Tags } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { User } from "@api/users";
import { LoginRequest } from "@api/users";

@Route("api/auth")
@Tags("Users")
class UsersDocs extends Controller {
  @Post()
  @SuccessResponse(HttpStatus.Ok, "User Logged in")
  @Response(HttpStatus.BadRequest, "Email or Password Invalid")
  async login(@Body() body: LoginRequest): Promise<{user: User; token: string}> {
    return null as any;
  }
}