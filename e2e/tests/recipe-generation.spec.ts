import { expect } from "@playwright/test";
import { test, setupAuthenticatedPage, createRecipe } from "./helpers";

test.describe("Recipe Generation From Ingredients", () => {
  test("user can add ingredients and generate recipe ideas", async ({ page }) => {
    await setupAuthenticatedPage(page, "/fridge.html", "#ingredient-input");

    await page.fill("#ingredient-input", "flour");
    await page.click("#add-ingredient-btn");
    await expect(page.locator("#ingredient-tags-list .ingredient-tag")).toContainText("flour");

    await page.click("#generate-recipes-btn");

    await page.waitForSelector("#generated-recipes .recipe-item", { timeout: 2000 });

    // Mock LLM returns "Generated Recipe 1" with "AI Generated" badge. See backend/src/recipes/llmprovider/mock_llmprovider.ts
    const recipeItem = page.locator("#generated-recipes .recipe-item").first();
    await expect(recipeItem.locator("h4")).toHaveText("Generated Recipe 1");
    await expect(recipeItem.locator(".generated-badge")).toBeVisible();
  });

  test("finds existing matching recipes", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/fridge.html", "#ingredient-input");

    // Create a recipe with "flour" ingredient so it appears in matching results
    await createRecipe(user.token, {
      name: "My Flour Recipe",
      ingredients: [{ name: "flour", amount: 100, unit: "g" }],
    });

    await page.fill("#ingredient-input", "flour");
    await page.click("#add-ingredient-btn");
    await expect(page.locator("#ingredient-tags-list .ingredient-tag")).toContainText("flour");

    // Find matching recipes shows existing recipes first
    await page.click("#find-recipes-btn");
    await page.waitForSelector("#matching-recipes .recipe-item", { timeout: 2000 });

    await expect(page.locator("#matching-section")).toBeVisible();
    await expect(page.locator("#matching-recipes .recipe-item h4", { hasText: "My Flour Recipe" })).toBeVisible();
  });

  test("accepting a generated recipe persists it to the recipe list", async ({ page }) => {
    await setupAuthenticatedPage(page, "/fridge.html", "#ingredient-input");

    await page.fill("#ingredient-input", "flour");
    await page.click("#add-ingredient-btn");
    await page.click("#generate-recipes-btn");
    await page.waitForSelector("#generated-recipes .recipe-item", { timeout: 2000 });

    // Click the generated recipe to open it in the create-recipe form
    await page.locator("#generated-recipes .recipe-item").first().click();
    await page.waitForURL(/create-recipe\.html/, { timeout: 2000 });

    // Form should be pre-filled with mock LLM data
    await expect(page.locator("#recipe-name")).toHaveValue("Generated Recipe 1");

    // Accept the form to persist the recipe
    await page.click('button[type="submit"]');
    await expect(page.locator("#form-message")).toContainText("Recipe created successfully");

    await page.waitForURL(/recipe\.html/, { timeout: 2000 });
    await page.goto("/recipe.html?mine=1");
    await expect(page.locator(".recipe-card h3", { hasText: "Generated Recipe 1" })).toBeVisible();
  });

  test("rejecting a generated recipe does not persist it", async ({ page }) => {
    await setupAuthenticatedPage(page, "/fridge.html", "#ingredient-input");

    await page.fill("#ingredient-input", "flour");
    await page.click("#add-ingredient-btn");
    await page.click("#generate-recipes-btn");
    await page.waitForSelector("#generated-recipes .recipe-item", { timeout: 2000 });

    // Click the generated recipe to open it in the create-recipe form
    await page.locator("#generated-recipes .recipe-item").first().click();
    await page.waitForURL(/create-recipe\.html/, { timeout: 2000 });
    await expect(page.locator("#recipe-name")).toHaveValue("Generated Recipe 1");

    // Navigate away without submitting
    await page.goto("/recipe.html?mine=1");

    // The generated recipe should NOT appear in the recipe list
    await expect(page.locator(".recipe-card h3", { hasText: "Generated Recipe 1" })).toHaveCount(0);
  });
});
