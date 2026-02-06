import bcrypt from "bcrypt";
import { NeonDbError, NeonQueryFunction } from "@neondatabase/serverless";
import { ConflictError, NotFoundError } from "@api/helpers/errors";
import { PostgresErrorCode } from "@api/helpers/postgres";
import type { IUsersRepository, User, AuthInfo, UserInternal } from "./users";

export class UsersRepository implements IUsersRepository {
  constructor(private db: NeonQueryFunction<false, true>) {}

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
        RETURNING *
      `;

      return result.rows[0] as UserInternal;
    } catch (err) {
      if (err instanceof NeonDbError && err.code === PostgresErrorCode.UniqueViolation) {
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
        "passwordHash",
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

  async GetAuthInfoByEmail(email: string): Promise<AuthInfo> {
    const result = await this.db`
      SELECT
        "id",
        "email",
        "passwordHash"
      FROM users
      WHERE "email" = ${email}
    `;

    if (result.rows.length === 0) {
      throw new NotFoundError("user");
    }

    return result.rows[0] as AuthInfo;
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
    if (result.rows.length === 0) {
      throw new NotFoundError("user");
    }
    return result.rows[0] as AuthInfo;
  }
}
