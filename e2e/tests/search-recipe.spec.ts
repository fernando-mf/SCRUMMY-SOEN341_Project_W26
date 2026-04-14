import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm } from "./helpers";

test.describe("Recipe Search", () => {
  test("user can search for a recipe by exact name match", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Exact Match Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/recipe.html");
    await page.waitForSelector("#recipes-list");

    await page.fill("#search-input", recipeName);
    await page.click("#search-btn");

    await page.waitForSelector(".recipe-card", { timeout: 2000 });

    const recipeCard = page.locator(".recipe-card h3", { hasText: recipeName });
    await expect(recipeCard).toBeVisible();
  });

  test("user can search for a recipe by partial name match", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Partial Search Test Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/recipe.html");
    await page.waitForSelector("#recipes-list");

    const searchTerm = "Partial Search";
    await page.fill("#search-input", searchTerm);
    await page.click("#search-btn");

    await page.waitForSelector(".recipe-card", { timeout: 2000 });

    const recipeCard = page.locator(".recipe-card h3", { hasText: recipeName });
    await expect(recipeCard).toBeVisible();
  });

  test("search returns empty results when no recipes match", async ({ page }) => {
    await setupAuthenticatedPage(page, "/recipe.html", "#recipes-list");

    const nonExistentQuery = `NoSuchRecipe${Date.now()}XYZ`;
    await page.fill("#search-input", nonExistentQuery);
    await page.click("#search-btn");

    await page.waitForTimeout(500);

    const recipeCards = page.locator(".recipe-card");
    const message = page.locator("#recipes-message");

    const cardCount = await recipeCards.count();
    const hasMessage = await message.isVisible();

    expect(cardCount === 0 || hasMessage).toBeTruthy();
  });
});