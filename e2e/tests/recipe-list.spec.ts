import { expect } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm } from "./helpers";

test.describe("Recipe List Page", () => {
  test("user can see their own recipes on the My Recipes tab", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `My Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/recipe.html?mine=1");
    await page.waitForSelector("#recipes-list");

    const recipeCard = page.locator(".recipe-card h3", { hasText: recipeName });
    await expect(recipeCard).toBeVisible();
  });

  test("clicking 'All Recipes' renders all recipes available in MealMajor", async ({ page }) => {
    await setupAuthenticatedPage(page, "/recipe.html?mine=1", "#my-recipes-btn");

    const allRecipesBtn = page.locator("#my-recipes-btn");
    await expect(allRecipesBtn).toHaveText("All Recipes");

    await allRecipesBtn.click();
    await page.waitForSelector("#recipes-list");

    // Ensure our mocked recipe is visible in the list
    const sampleCard = page.locator(".recipe-card h3", { hasText: "Roasted Tomato Pasta" });
    await expect(sampleCard).toBeVisible();
  });
});
