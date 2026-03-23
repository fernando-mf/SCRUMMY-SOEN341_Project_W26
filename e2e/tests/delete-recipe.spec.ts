import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm } from "./helpers";

test.describe("Delete Recipe", () => {
  test("successfully deletes a recipe", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    // To delete currently made recipe
    const recipeName = `Listed Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 5000 });    

    // Navigate to My Recipes to avoid sample recipe noise
    await page.goto("/recipe.html?mine=1");
    await page.waitForSelector("#recipes-list");

    // Dialog has to confirmed before click
    page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Delete this recipe permanently?");
        await dialog.accept();
    });

    const recipeCard = page.locator(".recipe-card", { hasText: recipeName});
    await recipeCard.locator(".recipe-delete-btn").click();

    const message = page.locator("#recipes-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText(/Recipe deleted successfully.|You have not created any recipes yet./);

    await expect(page.locator("h3", { hasText: recipeName })).toHaveCount(0);
  });

  test("successfully deletes one recipe while another remains", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    // Recipe to keep
    const toKeepRecipeName = `Stay Recipe ${Date.now()}`;
    await fillRecipeForm(page, toKeepRecipeName);
    await page.click('button[type="submit"]');

    // Recipe to delete
    await page.goto("/create-recipe.html");
    const toDeleteRecipeName = `Delete Recipe ${Date.now()}`;
    await fillRecipeForm(page, toDeleteRecipeName);
    await page.click('button[type="submit"]');

    await page.goto("/recipe.html?mine=1");
    await page.waitForSelector("#recipes-list");

    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Delete this recipe permanently?");
      await dialog.accept();
    });

    const deleteCard = page.locator(".recipe-card", { hasText: toDeleteRecipeName });
    const stayCard = page.locator(".recipe-card", { hasText: toKeepRecipeName });

    await deleteCard.locator(".recipe-delete-btn").click();

    const message = page.locator("#recipes-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText("Recipe deleted successfully");

    await expect(page.locator("h3", { hasText: toDeleteRecipeName })).toHaveCount(0);
    await expect(stayCard).toBeVisible();
  });

  test("canceling the confirm dialog does not delete the recipe", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");
    
    const recipeName = `Listed Recipe ${Date.now()}`;
    await fillRecipeForm(page, recipeName);

    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 5000 });    

    await page.goto("/recipe.html?mine=1");
    await page.waitForSelector("#recipes-list");

    //Cancel
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Delete this recipe permanently?");
      await dialog.dismiss();
    });

    const recipeCard = page.locator(".recipe-card", { hasText: recipeName});
    await recipeCard.locator(".recipe-delete-btn").click();

    await expect(page.locator("h3", { hasText: recipeName })).toBeVisible();
  });
});
