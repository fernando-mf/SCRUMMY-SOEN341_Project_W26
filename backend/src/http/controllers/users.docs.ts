import { Body, Controller, Post, Get, Path, Put, Route, SuccessResponse, Response, Tags } from "tsoa";
import { User, UpdateUserRequest, CreateUserRequest } from "@api/users";
import { HttpStatus } from "@api/helpers/http";

@Route("api/users")
@Tags("Users")
class UsersDocs extends Controller {
  @Post()
  @SuccessResponse(HttpStatus.Created, "User Created")
  async createUser(@Body() body: CreateUserRequest): Promise<User> {
    return null as any;
  }

  @Get("{id}")
  @Response(HttpStatus.NotFound, "User not found")
  async getUser(@Path() id: number): Promise<User> {
    return null as any;
  }

  @Put("{id}")
  @SuccessResponse(204, "No Content")
  @Response(HttpStatus.NotFound, "User not found")
  async updateUser(@Path() id: number, @Body() body: UpdateUserRequest): Promise<void> {}
}
