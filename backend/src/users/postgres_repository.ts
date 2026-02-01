import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { IUsersRepository, User } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: NeonQueryFunction<false, true>) {}

  // TODO: implement
  async CreateUser(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
}
