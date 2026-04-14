import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm, fillMealPlanForm } from "./helpers";

test.describe("Edit Meal Plans", () => {
  test("user can edit an existing meal assignment", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipe1 = `Original Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipe1);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Friday",
      mealType: "dinner",
      recipeName: recipe1,
    });
    await page.click("#save-assignment-btn");

    const editButton = page.locator("button[data-action='edit']").first();
    await editButton.click();

    const saveButton = page.locator("#save-assignment-btn");
    await expect(saveButton).toContainText("Update Meal");

    await page.selectOption("#meal-day", "Saturday");
    await page.click("#save-assignment-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal assignment saved");
  });

  test("removing recipe from meal slot persists to backend", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Remove Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Sunday",
      mealType: "breakfast",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    const removeButton = page.locator("button[data-action='remove']").first();
    await removeButton.click();

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal removed from planner");

    await page.reload();
    await page.waitForSelector("#week-grid");

    const mealPill = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPill).toHaveCount(0);
  });

  test("editing meal assignment changes time slot", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Edit Time Slot Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Monday",
      mealType: "breakfast",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    const editButton = page.locator("button[data-action='edit']").first();
    await editButton.click();

    await expect(page.locator("#save-assignment-btn")).toContainText("Update Meal");

    await page.selectOption("#meal-day", "Thursday");
    await page.selectOption("#meal-type", "dinner");
    await page.click("#save-assignment-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal assignment saved");

    const mealPill = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPill).toBeVisible();
  });

  test("clearing weekly plan removes all meals", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Clear Week Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Monday",
      mealType: "breakfast",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    await page.click("#clear-week-btn");

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Current week cleared");

    const mealPills = page.locator(".meal-pill");
    await expect(mealPills).toHaveCount(0);
  });
});
