import { beforeEach, describe, expect, test } from "vitest";
import { DayOfWeek, MealPlan, MealType } from "@api/meal-plans";
import { Difficulty, Recipe, Unit } from "@api/recipes";
import { Client, NewClient } from "./client";
import { BeginUserSession, PurgeDatabase } from "./helpers";

describe("MealPlansService", () => {
  describe("Create", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const recipe = await client.RecipesService.Create(user.id, {
        name: "Test Recipe",
        ingredients: [{ name: "Test", amount: 1, unit: Unit.G }],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 1,
      });

      const startDate = new Date("2026-04-01");
      const endDate = new Date("2026-04-07");

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "My Healthy Week",
        weekNumber: 14,
        startDate: startDate,
        endDate: endDate,
        entries: [
          {
            recipeId: recipe.id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      expect(mealPlan.id).toBeDefined();
      expect(mealPlan.name).toBe("My Healthy Week");
      expect(mealPlan.entries.length).toBe(1);
      expect(mealPlan.entries[0].recipeId).toBe(recipe.id);
    });

    test("fails when entries array is empty", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Empty Plan",
        weekNumber: 1,
        startDate: new Date(),
        endDate: new Date(),
        entries: [], // Zod requires .min(1)
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails when endDate is before startDate", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Time Travel Plan",
        weekNumber: 1,
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-04-01"), // Before start
        entries: [
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails with invalid weekNumber", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Invalid Week",
        weekNumber: 53, // Max 52
        startDate: new Date(),
        endDate: new Date(),
        entries: [
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails with invalid enum values", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Invalid Enum",
        weekNumber: 1,
        startDate: new Date(),
        endDate: new Date(),
        entries: [
          {
            recipeId: 1,
            dayOfWeek: "not-a-day" as any,
            mealType: "brunch" as any,
          },
        ],
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });
  });

  describe("Update", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      // Create a recipe first
      const recipe = await client.RecipesService.Create(user.id, {
        name: "Test Recipe",
        ingredients: [{ name: "Test", amount: 1, unit: Unit.G }],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 1,
      });

      const startDate = new Date("2026-04-01");
      const endDate = new Date("2026-04-07");

      // Create a meal plan
      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "My Healthy Week",
        weekNumber: 14,
        startDate: startDate,
        endDate: endDate,
        entries: [
          {
            recipeId: recipe.id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      // Update the meal plan
      await client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Updated Healthy Week",
        weekNumber: 15,
        startDate: new Date("2026-04-05"),
        endDate: new Date("2026-04-11"),
        entries: [
          {
            recipeId: recipe.id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      const updatedMealPlan = await client.MealPlansService.Get(mealPlan.id);

      // Assert the updated values
      expect(updatedMealPlan.name).toBe("Updated Healthy Week");
      expect(updatedMealPlan.weekNumber).toBe(15);
      expect(new Date (updatedMealPlan.startDate)).toEqual(new Date("2026-04-05"));
      expect(new Date (updatedMealPlan.endDate)).toEqual(new Date("2026-04-11"));
      expect(updatedMealPlan.entries.length).toBe(1);
      expect(updatedMealPlan.entries[0].dayOfWeek).toBe(DayOfWeek.WEDNESDAY);
      expect(updatedMealPlan.entries[0].mealType).toBe(MealType.DINNER);
    });

    test("fails when meal plan does not exist", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      // Trying to update a non-existing meal plan
      const promise = client.MealPlansService.Update(user.id, 99999, {
        name: "Non-Existing Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-05"),
        endDate: new Date("2026-04-11"),
        entries: [],
      });

      await expect(promise).rejects.toThrow();
    });

    test("fails when validation fails", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      // Create a recipe first
      const recipe = await client.RecipesService.Create(user.id, {
        name: "Test Recipe",
        ingredients: [{ name: "Test", amount: 1, unit: Unit.G }],
        prepTimeMinutes: 10,
        prepSteps: "Steps",
        cost: 10,
        difficulty: Difficulty.EASY,
        dietaryTags: [],
        allergens: [],
        servings: 1,
      });

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "Valid Plan",
        weekNumber: 14,
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-07"),
        entries: [
          {
            recipeId: recipe.id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      // Invalid update: endDate before startDate
      const promise = client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Invalid Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-05"),
        endDate: new Date("2026-04-04"), // Invalid endDate
        entries: [
          {
            recipeId: recipe.id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toThrow();
    });
  });
});

describe("Delete", () => {
  beforeEach(async () => {
    await PurgeDatabase();
  });

  test("success", async () => {
    const client = NewClient();
    const { user } = await BeginUserSession(client);

    const recipe = await client.RecipesService.Create(user.id, {
      name: "Test Recipe",
      ingredients: [{ name: "Test", amount: 1, unit: Unit.G }],
      prepTimeMinutes: 10,
      prepSteps: "Steps",
      cost: 10,
      difficulty: Difficulty.EASY,
      dietaryTags: [],
      allergens: [],
      servings: 1,
    });

    const startDate = new Date("2026-04-01");
    const endDate = new Date("2026-04-07");

    const mealPlan = await client.MealPlansService.Create(user.id, {
      name: "My Healthy Week",
      weekNumber: 14,
      startDate: startDate,
      endDate: endDate,
      entries: [
        {
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.MONDAY,
          mealType: MealType.LUNCH,
        },
      ],
    });

    await client.MealPlansService.Delete(user.id, mealPlan.id);

    const promise = client.MealPlansService.Get(mealPlan.id);
    await expect(promise).rejects.toThrow();
  });
});
