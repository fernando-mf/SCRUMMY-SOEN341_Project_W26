import postgres from "postgres";
import { Difficulty, Recipe, Unit } from "@api/recipes";
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

export async function insertTestRecipes(client: Client, userId: number, count: number, modifier?: Partial<Recipe>) {
  let recipe = {
    authorId: userId,
    name: `Recipe`,
    ingredients: [
      { amount: 100, name: "Ingredient 1", unit: Unit.G },
      { amount: 200, name: "Ingredient 2", unit: Unit.ML },
      { amount: 300, name: "Ingredient 3", unit: Unit.TBSP },
      { amount: 400, name: "Ingredient 4", unit: Unit.TSP },
    ],
    prepTimeMinutes: 10,
    prepSteps: "Test steps",
    cost: 10,
    difficulty: Difficulty.EASY,
    dietaryTags: ["vegan", "vegetarian"],
    allergens: ["gluten", "dairy"],
    servings: 4,

    ...modifier,
  };

  const name = recipe.name;

  for (let i = 0; i < count; i++) {
    recipe.name = `${name} ${i + 1}`;
    await client.RecipesService.Create(userId, recipe);
  }
}
