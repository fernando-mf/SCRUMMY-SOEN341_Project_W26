import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage } from "./helpers";

async function fillRecipeForm(page: Page, recipeName: string) {
  await page.fill("#recipe-name", recipeName);
  await page.fill("#cook-time", "20");
  await page.fill("#servings", "2");
  await page.selectOption("#difficulty", "easy");

  // Add one ingredient
  await page.fill("#ingredient-name", "Flour");
  await page.fill("#ingredient-amount", "200");
  await page.selectOption("#ingredient-unit", "g");
  await page.click("#add-ingredient-btn");

  // Add one preparation step
  await page.click("#add-step-btn");
  await page.fill(".step-input", "Mix all ingredients together");

  // Blur the textarea so the change event fires and updates the steps array
  await page.locator(".step-input").evaluate((el) => el.blur());
}

test.describe("Create Recipe", () => {
  test("successfully creates a recipe and redirects to recipe list", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Test Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText("Recipe created successfully");

    await page.waitForURL(/recipe\.html/, { timeout: 2000 });
  });

  test("created recipe appears in the recipe list", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `Listed Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    // Navigate to My Recipes to avoid sample recipe noise
    await page.goto("/recipe.html?mine=1");

    const recipeCard = page.locator(".recipe-card h3", { hasText: recipeName });
    await expect(recipeCard).toBeVisible();
  });
});
