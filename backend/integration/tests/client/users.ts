import { CreateUserRequest, IUsersService, LoginRequest, LoginResponse, UpdateUserRequest, User } from "@api/users";
import { ApiClient } from "./internal";

export class UsersHttpClient implements IUsersService {
  constructor(private client: ApiClient) {}

  Create(request: CreateUserRequest): Promise<User> {
    return this.client.Request({
      url: "/api/auth/register",
      method: "POST",
      body: request,
    });
  }

  Login(request: LoginRequest): Promise<LoginResponse> {
    return this.client.Request({
      url: "/api/auth/login",
      method: "POST",
      body: request,
    });
  }

  Update(userID: number, request: UpdateUserRequest): Promise<void> {
    return this.client.Request({
      url: `/api/users`,
      method: "PUT",
      body: request,
    });
  }

  Get(userID: number): Promise<User> {
    return this.client.Request({
      url: `/api/users`,
      method: "GET",
    });
  }
}
