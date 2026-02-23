import { beforeEach, describe, expect, test } from "vitest";
import { Difficulty, ListRecipesRequest, Unit } from "@api/recipes";
import { Client, NewClient } from "./client";
import { BeginUserSession, PurgeDatabase } from "./helpers";

describe("RecipesService", () => {
  describe("Create", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const recipe = await client.RecipesService.Create(user.id, {
        name: "Valid Recipe",
        ingredients: [
          { name: "Flour", amount: 100, unit: Unit.G },
        ],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: ["vegan"],
        allergens: [],
        servings: 2,
      });

      expect(recipe.id).toBeDefined();
      expect(recipe.name).toBe("Valid Recipe");
      expect(recipe.ingredients.length).toBe(1);
    });

    test("fails with missing required fields", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.RecipesService.Create(user.id, {
        name: "",
      } as any);

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails when ingredients array is empty", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.RecipesService.Create(user.id, {
        name: "Recipe",
        ingredients: [],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 2,
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails with invalid ingredient structure", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.RecipesService.Create(user.id, {
        name: "Recipe",
        ingredients: [
          { name: "", amount: -5, unit: "invalid" as any },
        ],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 2,
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails with negative numeric fields", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.RecipesService.Create(user.id, {
        name: "Recipe",
        ingredients: [
          { name: "Flour", amount: 100, unit: Unit.G },
        ],
        prepTimeMinutes: -1,
        prepSteps: "Steps",
        cost: -5,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 0,
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });
  });

  describe("List", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("invalid params", async () => {
      const client = NewClient();
      await BeginUserSession(client);

      const promise = client.RecipesService.List({
        limit: "invalid" as any,
        page: "invalid" as any,
        authors: "invalid" as any,
      });

      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: 400: invalid_params: {"params":{"page":"Invalid input: expected number, received NaN","limit":"Invalid input: expected number, received NaN","authors.0":"Invalid input: expected number, received NaN"}}]`,
      );
    });

    test("success - no results", async () => {
      const client = NewClient();
      await BeginUserSession(client);

      const res = await client.RecipesService.List({
        page: 1,
        limit: 10,
        authors: [],
      });

      expect(res).toMatchInlineSnapshot(`
        {
          "currentPage": 1,
          "data": [],
          "totalCount": 0,
          "totalPages": 0,
        }
      `);
    });

    test("success - with results and default params", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const recipeCount = 5;
      await insertTestRecipes(client, user.id, recipeCount);

      const res = await client.RecipesService.List({});

      expect(res.totalCount).toEqual(recipeCount);
      expect(res.totalPages).toEqual(1);
      expect(res.currentPage).toEqual(1);
      expect(res.data.length).toEqual(recipeCount);

      expect(res).toMatchSnapshot();
    });

    test("success - pagination", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const recipeCount = 3;
      await insertTestRecipes(client, user.id, recipeCount);

      const params: Partial<ListRecipesRequest> = {
        page: 1,
        limit: 1,
      };

      // page 1
      let res = await client.RecipesService.List(params);
      expect(res.totalPages).toBe(recipeCount);
      expect(res.totalCount).toBe(recipeCount);
      expect(res.currentPage).toBe(1);
      expect(res.data.length).toBe(1);

      // page 2
      params.page = 2;
      res = await client.RecipesService.List(params);
      expect(res.totalPages).toBe(recipeCount);
      expect(res.totalCount).toBe(recipeCount);
      expect(res.currentPage).toBe(2);
      expect(res.data.length).toBe(1);

      // page 3
      params.page = 3;
      res = await client.RecipesService.List(params);
      expect(res.totalPages).toBe(recipeCount);
      expect(res.totalCount).toBe(recipeCount);
      expect(res.currentPage).toBe(3);
      expect(res.data.length).toBe(1);

      // page 4
      params.page = 4;
      res = await client.RecipesService.List(params);
      expect(res.currentPage).toBe(4);
      expect(res.data.length).toBe(0); // no more results
    });

    test("filters - authors", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const userId = user.id;
      const otherUserId = userId + 1;

      await insertTestRecipes(client, userId, 1);

      let res = await client.RecipesService.List({ authors: [userId] });
      expect(res.data.length).toBe(1);
      expect(res.data[0].authorId).toBe(userId);

      res = await client.RecipesService.List({ authors: [otherUserId] });
      expect(res.data.length).toBe(0);
    });
  });
});

async function insertTestRecipes(client: Client, userId: number, count: number) {
  for (let i = 0; i < count; i++) {
    await client.RecipesService.Create(userId, {
      name: `Recipe ${i + 1}`,
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
    });
  }
}
