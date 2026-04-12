import { expect } from "@playwright/test";
import { test, setupAuthenticatedPage, createRecipe } from "./helpers";

test.describe("Edit Recipe", () => {
  test("can open a created recipe in the Edit Recipe page", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/recipe.html?mine=1", "#search-input");
    const recipeName = `Edit Open Test ${Date.now()}`;
    await createRecipe(user.token, { name: recipeName });

    await page.reload();
    await page.waitForSelector(".recipe-card");

    const recipeCard = page.locator(".recipe-card", { hasText: recipeName });
    await recipeCard.locator(".recipe-edit-btn").click();

    await page.waitForURL(/create-recipe\.html.*edit=/, { timeout: 2000 });
    await page.waitForSelector('button[type="submit"]:has-text("Update Recipe")', { timeout: 2000 });

    await expect(page.locator("#recipe-name")).toHaveValue(recipeName);
  });

  test("edited attributes are persisted and reflected in the recipe list", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/recipe.html?mine=1", "#search-input");
    const originalName = `Original ${Date.now()}`;
    const updatedName = `Updated ${Date.now()}`;

    const recipe = await createRecipe(user.token, { name: originalName });

    await page.goto(`/create-recipe.html?edit=${recipe.id}`);
    await page.waitForSelector('button[type="submit"]:has-text("Update Recipe")', { timeout: 2000 });

    await page.fill("#recipe-name", updatedName);
    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText("Recipe updated successfully");
    await page.waitForURL((url) => url.pathname === "/recipe.html", { timeout: 2000 });
    await page.waitForSelector("#recipes-list");

    const recipeCard = page.locator(".recipe-card h3", { hasText: updatedName });
    await expect(recipeCard).toBeVisible();
  });
});
