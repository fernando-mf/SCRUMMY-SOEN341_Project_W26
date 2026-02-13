import postgres from "postgres";
import { ConflictError, NotFoundError } from "@api/helpers/errors";
import { PostgresErrorCode } from "@api/helpers/postgres";
import type { AuthInfo, IUsersRepository, User, UserInternal } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: postgres.Sql) {}

  async Create(user: Omit<UserInternal, "id">): Promise<UserInternal> {
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

      return result[0] as UserInternal;
    } catch (err) {
      if (err instanceof postgres.PostgresError && err.code === PostgresErrorCode.UniqueViolation) {
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

    if (result.count === 0) {
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
        "allergies"
      FROM users
      WHERE "id" = ${userID}
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

  async GetAuthInfo(userID: number): Promise<AuthInfo> {
    const result = await this.db`
      SELECT
        "id",
        "email",
        "passwordHash"
      FROM users
      WHERE "id" = ${userID}
    `;
    if (result.length === 0) {
      throw new NotFoundError("user");
    }
    return result[0] as AuthInfo;
  }
}
