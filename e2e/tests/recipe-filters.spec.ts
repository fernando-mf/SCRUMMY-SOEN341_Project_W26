import { expect } from "@playwright/test";
import { test, setupAuthenticatedPage, createRecipe } from "./helpers";

test.describe("Recipe Filters", () => {
  test("applying a difficulty filter shows only matching recipes", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/recipe.html?mine=1", "#filters-toggle");

    const suffix = Date.now();
    const easyName = `Easy Recipe ${suffix}`;
    const hardName = `Hard Recipe ${suffix}`;

    await createRecipe(user.token, { name: easyName, difficulty: "easy" });
    await createRecipe(user.token, { name: hardName, difficulty: "hard" });

    await page.reload();
    await page.waitForSelector("#recipes-list");

    // Open the filters panel
    await page.click("#filters-toggle");
    await page.waitForSelector("#recipe-filters:not(.hidden)");

    // Select "hard" difficulty
    await page.selectOption("#filter-difficulty", "hard");
    await page.click("#filters-apply");

    // Only the hard recipe should be visible
    await expect(page.locator(".recipe-card h3", { hasText: hardName })).toBeVisible();
    await expect(page.locator(".recipe-card h3", { hasText: easyName })).not.toBeVisible();
  });

  test("clicking Reset restores the unfiltered recipe list", async ({ page }) => {
    const user = await setupAuthenticatedPage(page, "/recipe.html?mine=1", "#filters-toggle");

    const suffix = Date.now();
    const easyName = `Easy Reset ${suffix}`;
    const mediumName = `Medium Reset ${suffix}`;

    await createRecipe(user.token, { name: easyName, difficulty: "easy" });
    await createRecipe(user.token, { name: mediumName, difficulty: "medium" });

    await page.reload();
    await page.waitForSelector("#recipes-list");

    // Open the filters panel and apply a filter
    await page.click("#filters-toggle");
    await page.waitForSelector("#recipe-filters:not(.hidden)");
    await page.selectOption("#filter-difficulty", "medium");
    await page.click("#filters-apply");

    // Only medium recipe visible
    await expect(page.locator(".recipe-card h3", { hasText: mediumName })).toBeVisible();
    await expect(page.locator(".recipe-card h3", { hasText: easyName })).not.toBeVisible();

    // Click Reset — both recipes should reappear
    await page.click("#filters-reset");

    await expect(page.locator(".recipe-card h3", { hasText: easyName })).toBeVisible();
    await expect(page.locator(".recipe-card h3", { hasText: mediumName })).toBeVisible();
  });
});
