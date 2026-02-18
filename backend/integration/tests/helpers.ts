import postgres from "postgres";
import { CreateUserRequest, User } from "@api/users";
import { Client } from "./client";

const connectionString = process.env.DATABASE_URL ?? "postgres://dev:dev@localhost:5432/mealmajor";
export const db = postgres(connectionString);

export async function PurgeDatabase() {
  const res = await db`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename != 'migrations'
      `;

  const tables = res.map((r) => `"${r.tablename}"`).join(", ");
  if (tables.length) {
    await db.unsafe(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  }
}

// BeginUserSession creates a new test user and attaches the access token to the client provided, all subsequent calls to the client will be authenticated.
export async function BeginUserSession(c: Client, params?: CreateUserRequest) {
  const newUser: CreateUserRequest = {
    firstName: "Jon",
    lastName: "Doe",
    email: "test@gmail.com",
    password: "password123",

    ...params,
  };

  const { user, token } = await c.UsersService.Create(newUser);

  c.SetAccessToken(token);

  return { user, token };
}
