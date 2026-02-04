import type { NeonQueryFunction } from "@neondatabase/serverless";
import { ConflictError, NotFoundError } from "@api/helpers/errors";
import type { IUsersRepository, User } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: NeonQueryFunction<false, true>) {}

  async Create(user: User): Promise<User> {
    try {
      const result = await this.db`
        INSERT INTO users (
          "firstName",
          "lastName",
          "email",
          "dietPreferences",
          "allergies"
        )
        VALUES (
          ${user.firstName},
          ${user.lastName},
          ${user.email},
          ${user.dietPreferences},
          ${user.allergies}
        )
        RETURNING *
      `;

      return result.rows[0] as User;
    } catch (err) {
      if (err?.code === "23505") { // unique_violation
        throw new ConflictError("email");
      }
      
      throw err;
    }
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
      throw new NotFoundError("user");
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

    if (user.rows.length === 0) {
      throw new NotFoundError("user");
    }

    return user.rows[0] as User;
  }
}
