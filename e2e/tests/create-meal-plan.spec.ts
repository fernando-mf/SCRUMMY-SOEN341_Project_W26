import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm, fillMealPlanForm } from "./helpers";

test.describe("Meal Plan Creation", () => {
  test("user can create a meal plan with a recipe assignment", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Meal Plan Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    const planName = `Test Plan ${Date.now()}`;
    await fillMealPlanForm(page, {
      planName,
      day: "Monday",
      mealType: "breakfast",
      recipeName,
    });

    await page.click("#save-assignment-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal assignment saved");
  });

  test("user can create a plan with multiple meal assignments", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipe1 = `Recipe One ${Date.now()}`;
    await fillRecipeForm(page, recipe1);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/create-recipe.html");
    const recipe2 = `Recipe Two ${Date.now()}`;
    await fillRecipeForm(page, recipe2);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    const planName = `Multi Meal Plan ${Date.now()}`;
    await fillMealPlanForm(page, {
      planName,
      day: "Monday",
      mealType: "breakfast",
      recipeName: recipe1,
    });
    await page.click("#save-assignment-btn");

    await fillMealPlanForm(page, {
      day: "Monday",
      mealType: "lunch",
      recipeName: recipe2,
    });
    await page.click("#save-assignment-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal assignment saved");

    const mealPills = page.locator(".meal-pill");
    await expect(mealPills).toHaveCount(2);
  });

  test("duplicate recipe in same week shows error", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Duplicate Test Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      planName: `DuplicateCheck ${Date.now()}`,
      day: "Monday",
      mealType: "breakfast",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    await fillMealPlanForm(page, {
      day: "Tuesday",
      mealType: "lunch",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("already assigned in this week");
  });

  test("created plan persists in meal planner view", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Persist Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    const planName = `Persist Plan ${Date.now()}`;
    await fillMealPlanForm(page, {
      planName,
      day: "Wednesday",
      mealType: "dinner",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    await page.reload();
    await page.waitForSelector("#week-grid");

    const mealPill = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPill).toBeVisible();
  });
});
