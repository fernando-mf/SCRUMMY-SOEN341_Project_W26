import postgres from "postgres";
import { ConflictError, NotFoundError } from "@api/helpers/errors";
import { PostgresErrorCode } from "@api/helpers/postgres";
import type { AuthInfo, IUsersRepository, User, UserInternal } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: postgres.Sql) {}

  async Create(user: Omit<UserInternal, "id">): Promise<User> {
    try {
      const result = await this.db`
        INSERT INTO users (
          "firstName",
          "lastName",
          "email",
          "passwordHash",
          "dietPreferences",
          "allergies"
        )
        VALUES (
          ${user.firstName},
          ${user.lastName},
          ${user.email},
          ${user.passwordHash},
          ${user.dietPreferences},
          ${user.allergies}
        )
        RETURNING
          "id",
          "firstName",
          "lastName",
          "email",
          "dietPreferences",
          "allergies"
      `;

      return result[0] as User;
    } catch (err) {
      if (err instanceof postgres.PostgresError && err.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictError("email");
      }

      throw err;
    }
  }

  async Update(userId: number, user: User): Promise<void> {
    const result = await this.db`
      UPDATE users
      SET
        "firstName" = ${user.firstName},
        "lastName" = ${user.lastName},
        "dietPreferences" = ${user.dietPreferences},
        "allergies" = ${user.allergies},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${userId}
    `;

    if (result.count === 0) {
      throw new NotFoundError("user");
    }
  }

  async Get(userId: number): Promise<User> {
    const user = await this.db`
      SELECT
        "id",
        "firstName",
        "lastName",
        "email",
        "dietPreferences",
        "allergies"
      FROM users
      WHERE "id" = ${userId}
    `;

    if (user.length === 0) {
      throw new NotFoundError("user");
    }

    return user[0] as User;
  }

  async GetAuthInfoByEmail(email: string): Promise<AuthInfo> {
    const result = await this.db`
      SELECT
        "id",
        "email",
        "passwordHash"
      FROM users
      WHERE "email" = ${email}
    `;

    if (result.length === 0) {
      throw new NotFoundError("user");
    }

    return result[0] as AuthInfo;
  }

  async GetAuthInfo(userId: number): Promise<AuthInfo> {
    const result = await this.db`
      SELECT
        "id",
        "email",
        "passwordHash"
      FROM users
      WHERE "id" = ${userId}
    `;
    if (result.length === 0) {
      throw new NotFoundError("user");
    }
    return result[0] as AuthInfo;
  }
}
