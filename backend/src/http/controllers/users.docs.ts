import { Body, Controller, Post, Get, Path, Put, Route, SuccessResponse, Response, Tags, Security } from "tsoa";
import { User, UpdateUserRequest, CreateUserRequest } from "@api/users";
import { HttpStatus } from "@api/helpers/http";

@Route("api/users")
@Tags("Users")
class UsersDocs extends Controller {
  @Post()
  @SuccessResponse(HttpStatus.Created, "User Created")
  @Response(HttpStatus.Conflict, "Email already exists")
  async createUser(@Body() body: CreateUserRequest): Promise<User> {
    return null as any;
  }

  @Get()
  @Security("jwt")
  @Response(HttpStatus.NotFound, "User not found")
  async getUser(): Promise<User> {
    return null as any;
  }

  @Put()
  @Security("jwt")
  @SuccessResponse(204, "No Content")
  @Response(HttpStatus.NotFound, "User not found")
  async updateUser(@Body() body: UpdateUserRequest): Promise<void> {}

}
