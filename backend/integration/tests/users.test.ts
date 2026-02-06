import { beforeEach, describe, expect, test } from "vitest";
import { CreateUserRequest } from "@api/users";
import { NewClient } from "./client";
import { PurgeDatabase } from "./helpers";

describe("UsersService", () => {
  beforeEach(async () => {
    await PurgeDatabase();
  });

  describe("Create", () => {
    test("success", async () => {
      const client = NewClient();

      const user = await client.UsersService.Create({
        email: "test@gmail.com",
        firstName: "Jon",
        lastName: "Doe",
        password: "password123",
      });

      expect(user.id).greaterThan(0);
      expect(user.firstName).equal("Jon");
      expect(user.lastName).equal("Doe");
    });

    test("duplicate email", async () => {
      const client = NewClient();

      const sameProfile: CreateUserRequest = {
        email: "test@test.com",
        firstName: "Jon",
        lastName: "Doe",
        password: "password123",
      };

      await client.UsersService.Create(sameProfile);
      const duplicateUser = client.UsersService.Create(sameProfile);

      await expect(duplicateUser).rejects.toMatchObject({
        status: 409,
        code: "conflict",
      });
    });
  });
});
