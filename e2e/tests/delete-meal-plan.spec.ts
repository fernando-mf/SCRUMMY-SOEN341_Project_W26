import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm, fillMealPlanForm } from "./helpers";

test.describe("Meal Plan Deletion", () => {
  test("user can delete a meal from the planner", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Delete Meal Recipe ${Date.now()}`;
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

    const mealPillBefore = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPillBefore).toBeVisible();

    const removeButton = page.locator("button[data-action='remove']");
    await removeButton.click();

    const message = page.locator("#planner-message");
    await expect(message).toContainText("Meal removed from planner");

    const mealPillAfter = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPillAfter).toHaveCount(0);
  });

  test("deleted meal no longer appears after page reload", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Persist Delete Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Wednesday",
      mealType: "lunch",
      recipeName,
    });
    await page.click("#save-assignment-btn");

    const removeButton = page.locator("button[data-action='remove']");
    await removeButton.click();

    await page.waitForTimeout(300);
    await page.reload();

    await page.waitForSelector("#week-grid");

    const mealPill = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPill).toHaveCount(0);
  });

  test("one meal can be deleted while others remain", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeToDelete = `Delete This Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeToDelete);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/create-recipe.html");
    const recipeToKeep = `Keep This Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeToKeep);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Monday",
      mealType: "breakfast",
      recipeName: recipeToDelete,
    });
    await page.click("#save-assignment-btn");

    await fillMealPlanForm(page, {
      day: "Tuesday",
      mealType: "lunch",
      recipeName: recipeToKeep,
    });
    await page.click("#save-assignment-btn");

    const deleteButtons = page.locator("button[data-action='remove']");
    const firstRemove = deleteButtons.first();
    await firstRemove.click();

    const deletedPill = page.locator(".meal-pill", { hasText: recipeToDelete });
    const keptPill = page.locator(".meal-pill", { hasText: recipeToKeep });

    await expect(deletedPill).toHaveCount(0);
    await expect(keptPill).toBeVisible();
  });
});
