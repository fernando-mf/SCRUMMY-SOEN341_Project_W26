import { expect } from "@playwright/test";
import { loginUser, registerUser, setupAuthenticatedPage, test, updateProfile } from "./helpers";

test.describe("View Profile", () => {
  test("profile page displays the user's name after login", async ({ page }) => {
    const user = await setupAuthenticatedPage(page);

    await expect(page.locator("#firstName")).toHaveValue(user.firstName);
    await expect(page.locator("#lastName")).toHaveValue(user.lastName);
  });

  test("profile page displays the user's diet preferences and allergies", async ({ page }) => {
    const { token } = await setupAuthenticatedPage(page);

    await updateProfile(token, {
      dietPreferences: ["Vegan", "Keto"],
      allergies: ["Peanuts", "Dairy"],
    });

    await page.reload();
    await page.waitForSelector("#firstName");

    await expect(page.locator('#diet-tags .tag[data-value="Vegan"]')).toHaveClass(/selected/);
    await expect(page.locator('#diet-tags .tag[data-value="Keto"]')).toHaveClass(/selected/);
    await expect(page.locator('#allergy-tags .tag[data-value="Peanuts"]')).toHaveClass(/selected/);
    await expect(page.locator('#allergy-tags .tag[data-value="Dairy"]')).toHaveClass(/selected/);
  });
});
