import { Body, Controller, Post, Route, SuccessResponse, Response, Tags } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateUserRequest, LoginRequest, LoginResponse, User } from "@api/users";

@Route("api/auth")
@Tags("Auth")
class AuthDocs extends Controller {
  @Post("login")
  @SuccessResponse(HttpStatus.Ok, "User Logged in")
  @Response(HttpStatus.BadRequest, "Email or Password Invalid")
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return null as any;
  }

  @Post("register")
  @SuccessResponse(HttpStatus.Created, "User Created")
  @Response(HttpStatus.Conflict, "Email already exists")
  async createUser(@Body() body: CreateUserRequest): Promise<User> {
    return null as any;
  }
}
