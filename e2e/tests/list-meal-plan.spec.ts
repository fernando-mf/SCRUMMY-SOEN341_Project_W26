import { expect, Page } from "@playwright/test";
import { test, setupAuthenticatedPage, fillRecipeForm, fillMealPlanForm } from "./helpers";

test.describe("List and View Meal Plans", () => {
  test("user can view weekly planner with existing plans", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipeName = `View Recipe ${Date.now()}`;
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

    const weekGrid = page.locator("#week-grid");
    await expect(weekGrid).toBeVisible();

    const dayCards = page.locator(".day-card");
    await expect(dayCards).toHaveCount(8);

    const mealPill = page.locator(".meal-pill", { hasText: recipeName });
    await expect(mealPill).toBeVisible();
  });

  test("existing plans render in correct week slots", async ({ page }) => {
    await setupAuthenticatedPage(page, "/create-recipe.html", "#create-recipe-form");

    const recipe1 = `Recipe Mon ${Date.now()}`;
    await fillRecipeForm(page, recipe1);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/create-recipe.html");
    const recipe2 = `Recipe Tue ${Date.now()}`;
    await fillRecipeForm(page, recipe2);
    await page.click('button[type="submit"]');
    await page.waitForURL(/recipe\.html/, { timeout: 2000 });

    await page.goto("/meal-plan.html");
    await page.waitForSelector("#week-grid");

    await fillMealPlanForm(page, {
      day: "Monday",
      mealType: "breakfast",
      recipeName: recipe1,
    });
    await page.click("#save-assignment-btn");

    await fillMealPlanForm(page, {
      day: "Tuesday",
      mealType: "lunch",
      recipeName: recipe2,
    });
    await page.click("#save-assignment-btn");

    const monPill = page.locator(".meal-pill", { hasText: recipe1 });
    const tuePill = page.locator(".meal-pill", { hasText: recipe2 });

    await expect(monPill).toBeVisible();
    await expect(tuePill).toBeVisible();
  });

  test("user can navigate between weeks", async ({ page }) => {
    await setupAuthenticatedPage(page, "/meal-plan.html", "#week-grid");

    const weekLabelBefore = await page.locator("#week-label").textContent();

    const nextButton = page.locator("button[data-week-nav='next']");
    await nextButton.click();

    await page.waitForTimeout(300);

    const weekLabelAfter = await page.locator("#week-label").textContent();

    expect(weekLabelBefore).not.toEqual(weekLabelAfter);
  });
});
