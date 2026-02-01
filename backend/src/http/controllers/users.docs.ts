import { Body, Controller, Get, Path, Put, Route, SuccessResponse, Response, Tags } from "tsoa";
import { User, UpdateUserRequest } from "@api/users";
import { HttpStatus } from "@api/helpers/http";

@Route("api/users")
@Tags("Users")
class UsersDocs extends Controller {
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
