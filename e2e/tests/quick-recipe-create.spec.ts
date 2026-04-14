import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm, fillMealPlanForm } from "./helpers";

test.describe("Quick Recipe Creation from Meal Planner", () => {
  test("user can create a recipe from meal planner and use it", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/meal-plan.html", "#week-grid");

    const quickRecipeName = `Quick Created ${Date.now()}`;

    await page.click("a:has-text('Create New Recipe')");
    await page.waitForSelector("#create-recipe-form");

    await fillRecipeForm(page, quickRecipeName);
    await page.click('button[type="submit"]');

    await page.waitForURL(/recipe\.html/, { timeout: 3000 });
    await page.goto("/meal-plan.html");
    await page.waitForSelector("#recipe-select");

    const recipeOptions = page.locator("#recipe-select option");
    const hasQuickRecipe = await recipeOptions.allTextContents().then(texts =>
      texts.some(text => text.includes(quickRecipeName))
    );
    await expect(hasQuickRecipe).toBeTruthy();
  });

  test("new recipe created via quick create appears in meal slot", async ({ page }) => {
    await setupAuthenticatedPage(page, "/meal-plan.html", "#week-grid");

    const quickRecipeName = `Quick Slot Recipe ${Date.now()}`;

    await page.click("a:has-text('Create New Recipe')");
    await page.waitForSelector("#create-recipe-form");

    await fillRecipeForm(page, quickRecipeName);
    await page.click('button[type="submit"]');

    await page.waitForURL(/recipe\.html/, { timeout: 3000 });
    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Thursday",
      mealType: "lunch",
      recipeName: quickRecipeName,
    });
    await page.click("#save-assignment-btn");

    const mealPill = page.locator(".meal-pill", { hasText: quickRecipeName });
    await expect(mealPill).toBeVisible();
  });

  test("quick created recipe can be searched in recipes page", async ({ page }) => {
    await setupAuthenticatedPage(page, "/meal-plan.html", "#week-grid");

    const quickRecipeName = `Quick Search Recipe ${Date.now()}`;

    await page.click("a:has-text('Create New Recipe')");
    await page.waitForSelector("#create-recipe-form");

    await fillRecipeForm(page, quickRecipeName);
    await page.click('button[type="submit"]');

    await page.waitForURL(/recipe\.html/, { timeout: 3000 });
    await page.waitForSelector("#recipes-list");

    await page.fill("#search-input", "Quick Search Recipe");
    await page.click("#search-btn");

    await page.waitForSelector(".recipe-card", { timeout: 2000 });

    const recipeCard = page.locator(".recipe-card h3", { hasText: quickRecipeName });
    await expect(recipeCard).toBeVisible();
  });
});
