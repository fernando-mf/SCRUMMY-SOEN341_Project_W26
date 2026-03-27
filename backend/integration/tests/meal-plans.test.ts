import { beforeEach, describe, expect, test } from "vitest";
import { DayOfWeek, MealPlan, MealType } from "@api/meal-plans";
import { Client, NewClient } from "./client";
import { BeginUserSession, insertTestRecipes, PurgeDatabase } from "./helpers";

describe("MealPlansService", () => {
  describe("Create", () => {
    beforeEach(async () => {
      await PurgeDatabase();
    });

    test("success", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const userId = user.id;

      await insertTestRecipes(client, userId, 3, { name: "Test Recipe" });

      const res = await client.RecipesService.List({ authors: [userId] });
      const recipes = res.data;

      expect(recipes.length).toBe(3);

      const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY];

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "My Healthy Week",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: days[i],
          mealType: MealType.LUNCH,
        })),
      });

      expect(mealPlan.id).toBeDefined();
      expect(mealPlan.name).toBe("My Healthy Week");
      expect(mealPlan.entries.length).toBe(3);

      for (let i = 0; i < 3; i++) {
        expect(mealPlan.entries[i].recipeId).toBe(recipes[i].id);
      }
    });

    test("fails when entries array is empty", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Empty Plan",
        weekNumber: 1,
        startDate: new Date(),
        entries: [],
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails when startDate is not Sunday or Monday", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Bad Start Date",
        weekNumber: 10,
        startDate: new Date("2026-04-01"),
        entries: [
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
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
        weekNumber: 53,
        startDate: new Date(),
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
      const userId = user.id;

      await insertTestRecipes(client, user.id, 1, { name: "Test Recipe" });

      const res = await client.RecipesService.List({ authors: [userId] });
      const recipes = res.data;

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "My Healthy Week",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.TUESDAY,
          mealType: MealType.LUNCH,
        })),
      });

      await client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Updated Healthy Week",
        weekNumber: 15,
        startDate: new Date("2026-04-06"),
        entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.WEDNESDAY,
          mealType: MealType.DINNER,
        })),
      });

      const updatedMealPlan = await client.MealPlansService.Get(mealPlan.id);

      expect(updatedMealPlan.name).toBe("Updated Healthy Week");
      expect(updatedMealPlan.weekNumber).toBe(15);
      expect(new Date(updatedMealPlan.startDate)).toEqual(new Date("2026-04-06"));
      expect(new Date(updatedMealPlan.endDate)).toEqual(new Date("2026-04-12"));
      expect(updatedMealPlan.entries.length).toBe(1);
      expect(updatedMealPlan.entries[0].dayOfWeek).toBe(DayOfWeek.WEDNESDAY);
      expect(updatedMealPlan.entries[0].mealType).toBe(MealType.DINNER);
    });

    test("fails when meal plan does not exist", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Update(user.id, 99999, {
        name: "Non-Existing Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-05"),
        entries: [],
      });

      await expect(promise).rejects.toThrow();
    });

    test("fails when validation fails", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);
      const userId = user.id;

      await insertTestRecipes(client, user.id, 1, { name: "Test Recipe" });

      const res = await client.RecipesService.List({ authors: [userId] });
      const recipes = res.data;

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "Valid Plan",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.TUESDAY,
          mealType: MealType.LUNCH,
        })),
      });

      const promise = client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Invalid Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-04"),
        entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.WEDNESDAY,
          mealType: MealType.DINNER,
        })),
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
    const userId = user.id;

    await insertTestRecipes(client, user.id, 1, { name: "Test Recipe" });

    const res = await client.RecipesService.List({ authors: [userId] });
    const recipes = res.data;

    const mealPlan = await client.MealPlansService.Create(user.id, {
      name: "My Healthy Week",
      weekNumber: 14,
      startDate: new Date("2026-03-30"),
      entries: recipes.slice(0, 3).map((recipe, i) => ({
          recipeId: recipe.id,
          dayOfWeek: DayOfWeek.TUESDAY,
          mealType: MealType.LUNCH,
        })),
    });

    await client.MealPlansService.Delete(user.id, mealPlan.id);

    const promise = client.MealPlansService.Get(mealPlan.id);
    await expect(promise).rejects.toThrow();
  });
});
