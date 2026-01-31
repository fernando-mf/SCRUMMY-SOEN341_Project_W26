import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { IUsersRepository, User } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: NeonQueryFunction<false, true>) {}

  // TODO: implement
  async Create(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  async Update(userID: number, user: User): Promise<void> {
    const result = await this.db`
      UPDATE users
      SET
        "firstName" = ${user.firstName},
        "lastName" = ${user.lastName},
        "dietPreferences" = ${user.dietPreferences},
        "allergies" = ${user.allergies},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${userID}
    `;

    if (result.rowCount === 0) {
      // TODO: handle user not found error
    }
  }

  async Get(userID: number): Promise<User> {
    const user = await this.db`
      SELECT
        "id",
        "firstName",
        "lastName",
        "email",
        "dietPreferences",
        "allergies",
        "createdAt",
        "updatedAt"
      FROM users
      WHERE "id" = ${userID}
    `;

    return user.rows[0] as User;
  }
}
