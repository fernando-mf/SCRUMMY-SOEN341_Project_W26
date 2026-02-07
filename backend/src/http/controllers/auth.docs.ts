
import { Body, Controller, Post, Get, Path, Put, Route, SuccessResponse, Response, Tags } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { User } from "@api/users";
import { LoginRequest, LoginResponse } from "@api/users";

@Route("api/auth")
@Tags("Auth")
class AuthDocs extends Controller {
  @Post("login")
  @SuccessResponse(HttpStatus.Ok, "User Logged in")
  @Response(HttpStatus.BadRequest, "Email or Password Invalid")
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return null as any;
  }
}