import postgres from "postgres";
import { Recipe } from "@api/recipes";
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

// TODO: TEMPORARY FUNCTION UNTIL THE `CREATE` METHOD IS IMPLEMENTED IN RECIPES SERVICE
// TODO: TEMPORARY FUNCTION UNTIL THE `CREATE` METHOD IS IMPLEMENTED IN RECIPES SERVICE
// TODO: TEMPORARY FUNCTION UNTIL THE `CREATE` METHOD IS IMPLEMENTED IN RECIPES SERVICE
export async function InsertRecipe(recipe: Omit<Recipe, "id">) {
  const result = await db<{ id: number }[]>`
    INSERT INTO recipes (
      "authorID",
      "name",
      "prepTimeMinutes",
      "prepSteps",
      "cost",
      "difficulty",
      "dietaryTags",
      "allergens",
      "servings"
    ) VALUES (
      ${recipe.authorID},
      ${recipe.name},
      ${recipe.prepTimeMinutes},
      ${recipe.prepSteps},
      ${recipe.cost},
      ${recipe.difficulty},
      ${recipe.dietaryTags},
      ${recipe.allergens},
      ${recipe.servings}
    ) RETURNING "id";
  `;
  const recipeId = result[0].id;

  if (recipe.ingredients.length == 0) {
    return;
  }

  const recipeData = recipe.ingredients.map((r) => ({
    ...r,
    recipeId,
  }));

  await db`
    INSERT INTO recipe_ingredients ${db(recipeData)}
  `;
}
