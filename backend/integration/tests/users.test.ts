import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { CreateUserRequest } from "@api/users";
import { NewClient } from "./client";
import { BeginUserSession, PurgeDatabase } from "./helpers";

describe("UsersService", () => {
  describe("Create", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();

      const res = await client.UsersService.Create({
        email: "test@gmail.com",
        firstName: "Jon",
        lastName: "Doe",
        password: "password123",
      });

      expect(res.user.id).greaterThan(0);
      expect(res.token).toBeTruthy();
      expect(res.user).toMatchSnapshot("create user response");
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

  describe("Login", () => {
    const client = NewClient();

    const email = "test@gmail.com";
    const password = "password123";

    beforeAll(async () => {
      await PurgeDatabase();

      await client.UsersService.Create({
        firstName: "Jon",
        lastName: "Doe",
        email,
        password,
      });
    });

    test("success", async () => {
      const res = await client.UsersService.Login({
        email,
        password,
      });

      expect(res.token).toBeTruthy();
      expect(res.expires_in).toBe(3600); // 1 hour
    });

    test("wrong password", async () => {
      const res = client.UsersService.Login({
        email,
        password: "wrongpassword",
      });

      return expect(res).rejects.toMatchObject({
        status: 401,
        code: "authentication_failed",
      });
    });
  });

  describe("Get", () => {
    beforeAll(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const res = await client.UsersService.Get(user.id);

      expect(res.id).toBe(user.id);
      expect(res).toMatchSnapshot("get user response");
    });

    test("unauthorized", async () => {
      const client = NewClient();

      const res = client.UsersService.Get(1);

      return expect(res).rejects.toMatchObject({
        status: 401,
        code: "authentication_failed",
      });
    });
  });

  describe("Update", () => {
    beforeAll(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      await client.UsersService.Update(user.id, {
        allergies: ["allergy1", "allergy2"],
        dietPreferences: ["diet1", "diet2"],
        firstName: "first name update",
        lastName: "last name update",
      });

      const res = await client.UsersService.Get(user.id);

      expect(res.email, "email should not change").toBe(user.email);
      expect(res).toMatchSnapshot("update user response");
    });
  });
});
