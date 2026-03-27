import { beforeEach, describe, expect, test } from "vitest";
import { DayOfWeek, MealType } from "@api/meal-plans";
import { Client, NewClient } from "./client";
import { ApiError } from "./client/internal";
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

      const mealPlan = await client.MealPlansService.Create(user.id, {
        name: "My Healthy Week",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
          {
            recipeId: recipes[1].id,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.LUNCH,
          },
          {
            recipeId: recipes[2].id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.LUNCH,
          },
        ],
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

    test("fails with duplicate dayOfWeek and mealType", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Duplicate Meal Entries",
        weekNumber: 1,
        startDate: new Date("2026-03-30"),
        entries: [
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
          {
            recipeId: 2,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      await expect(promise).rejects.toThrow("invalid_params");
    });

    test("fails with same recipe inserted multiple times", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);

      const promise = client.MealPlansService.Create(user.id, {
        name: "Duplicate Recipe Plan",
        weekNumber: 1,
        startDate: new Date("2026-03-30"),
        entries: [
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
          {
            recipeId: 1,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toThrow();
    });

    test("fails when creating a second meal plan in the same week for the same user", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);
      const userId = user.id;

      await insertTestRecipes(client, userId, 2, { name: "Unique Week Recipe" });

      const res = await client.RecipesService.List({ authors: [userId], search: "Unique Week Recipe" });
      const recipes = res.data;

      await client.MealPlansService.Create(userId, {
        name: "Week 14 Plan A",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      const promise = client.MealPlansService.Create(userId, {
        name: "Week 14 Plan B",
        weekNumber: 14,
        startDate: new Date("2026-04-06"),
        entries: [
          {
            recipeId: recipes[1].id,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toBeInstanceOf(ApiError);
      await expect(promise).rejects.toMatchObject({ code: "conflict", status: 409 });
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
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      await client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Updated Healthy Week",
        weekNumber: 15,
        startDate: new Date("2026-04-06"),
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.DINNER,
          },
        ],
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
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      const promise = client.MealPlansService.Update(user.id, mealPlan.id, {
        name: "Invalid Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-04"),
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      await expect(promise).rejects.toThrow();
    });

    test("fails when updating to a week already used by the same user", async () => {
      const client = NewClient();
      const { user } = await BeginUserSession(client);
      const userId = user.id;

      await insertTestRecipes(client, userId, 2, { name: "Update Week Conflict Recipe" });

      const res = await client.RecipesService.List({ authors: [userId], search: "Update Week Conflict Recipe" });
      const recipes = res.data;

      const week14 = await client.MealPlansService.Create(userId, {
        name: "Week 14 Plan",
        weekNumber: 14,
        startDate: new Date("2026-03-30"),
        entries: [
          {
            recipeId: recipes[0].id,
            dayOfWeek: DayOfWeek.MONDAY,
            mealType: MealType.LUNCH,
          },
        ],
      });

      const week15 = await client.MealPlansService.Create(userId, {
        name: "Week 15 Plan",
        weekNumber: 15,
        startDate: new Date("2026-04-06"),
        entries: [
          {
            recipeId: recipes[1].id,
            dayOfWeek: DayOfWeek.TUESDAY,
            mealType: MealType.DINNER,
          },
        ],
      });

      expect(week14.id).not.toBe(week15.id);

      const promise = client.MealPlansService.Update(userId, week15.id, {
        name: "Week 15 Updated",
        weekNumber: 14,
        startDate: new Date("2026-04-13"),
        entries: [
          {
            recipeId: recipes[1].id,
            dayOfWeek: DayOfWeek.WEDNESDAY,
            mealType: MealType.SNACK,
          },
        ],
      });

      await expect(promise).rejects.toBeInstanceOf(ApiError);
      await expect(promise).rejects.toMatchObject({ code: "conflict", status: 409 });
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
      entries: [
        {
          recipeId: recipes[0].id,
          dayOfWeek: DayOfWeek.TUESDAY,
          mealType: MealType.LUNCH,
        },
      ],
    });

    await client.MealPlansService.Delete(user.id, mealPlan.id);

    const promise = client.MealPlansService.Get(mealPlan.id);
    await expect(promise).rejects.toThrow();
  });
});

describe("GetMealPlanByStartDate", () => {
  beforeEach(async () => {
    await PurgeDatabase();
  });

  test("invalid params", async () => {
    const client = NewClient();
    const { user } = await BeginUserSession(client);

    const promise = client.MealPlansService.GetMealPlanByStartDate(user.id, {
      startDate: undefined as any,
    });

    await expect(promise).rejects.toThrow("invalid_params");
  });

  test("success - returns only authenticated user meal plan for a given date", async () => {
    const client = NewClient();
    const { user } = await BeginUserSession(client);

    const otherClient = NewClient();
    const { user: otherUser } = await BeginUserSession(otherClient, {
      email: "other.user@gmail.com",
      firstName: "Other",
      lastName: "User",
      password: "password123",
    });

    await createMealPlanForWeek(client, user.id, "Week A", 14, "2026-03-30");
    await createMealPlanForWeek(client, user.id, "Week B", 15, "2026-04-06");
    await createMealPlanForWeek(otherClient, otherUser.id, "Other User Week", 14, "2026-03-30");

    const res = await client.MealPlansService.GetMealPlanByStartDate(user.id, {
      startDate: new Date("2026-03-30"),
    });

    expect(res.name).toBe("Week A");
    expect(res.authorId).toBe(user.id);
  });

  test("success - returns the matching week", async () => {
    const client = NewClient();
    const { user } = await BeginUserSession(client);

    await createMealPlanForWeek(client, user.id, "Week A", 14, "2026-03-30");
    await createMealPlanForWeek(client, user.id, "Week B", 15, "2026-04-06");

    const currentWeek = await client.MealPlansService.GetMealPlanByStartDate(user.id, {
      startDate: new Date("2026-03-30"),
    });
    expect(currentWeek.name).toBe("Week A");

    const nextWeek = await client.MealPlansService.GetMealPlanByStartDate(user.id, {
      startDate: new Date("2026-04-06"),
    });
    expect(nextWeek.name).toBe("Week B");
  });

  test("fails when there is no meal plan for the given startDate", async () => {
    const client = NewClient();
    const { user } = await BeginUserSession(client);

    await createMealPlanForWeek(client, user.id, "Alpha Plan", 14, "2026-03-30");

    const promise = client.MealPlansService.GetMealPlanByStartDate(user.id, {
      startDate: new Date("2026-04-06"),
    });

    await expect(promise).rejects.toThrow("not_found");
  });
});

async function createMealPlanForWeek(client: Client, userId: number, name: string, weekNumber: number, startDate: string) {
  await insertTestRecipes(client, userId, 1, { name: `${name} Recipe` });
  const recipes = await client.RecipesService.List({ authors: [userId], search: `${name} Recipe` });

  const recipe = recipes.data[0];

  return client.MealPlansService.Create(userId, {
    name,
    weekNumber,
    startDate: new Date(startDate),
    entries: [
      {
        recipeId: recipe.id,
        dayOfWeek: DayOfWeek.MONDAY,
        mealType: MealType.LUNCH,
      },
    ],
  });
}
