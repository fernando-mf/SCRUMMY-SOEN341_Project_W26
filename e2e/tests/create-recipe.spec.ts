import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm } from "./helpers";

test.describe("Create Recipe", () => {
  test("successfully creates a recipe and redirects to recipe list", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Test Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText("Recipe created successfully");

    await page.waitForURL(/recipe\.html/, { timeout: 5000 });
  });

  test("created recipe appears in the recipe list", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Listed Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 5000 });

    // Navigate to My Recipes to avoid sample recipe noise
    await page.goto("/recipe.html?mine=1");
    await page.waitForSelector("#recipes-list");

    const recipeCard = page.locator(".recipe-card h3", { hasText: recipeName });
    await expect(recipeCard).toBeVisible({ timeout: 10000 });
  });
});
