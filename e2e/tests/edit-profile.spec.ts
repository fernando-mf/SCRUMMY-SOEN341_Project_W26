import { expect, Page } from "@playwright/test";
import { loginUser, registerUser, test } from "./helpers";

async function setupAuthenticatedPage(page: Page) {
  const user = await registerUser();
  const token = await loginUser(user.email, user.password);

  await page.goto("/login.html");
  await page.evaluate((t) => localStorage.setItem("token", t), token);
  await page.goto("/profile.html");
  await page.waitForSelector("#firstName");

  return user;
}

test.describe("Edit Profile", () => {
  test("profile page loads with registered user data", async ({ page }) => {
    const user = await setupAuthenticatedPage(page);

    await expect(page.locator("#firstName")).toHaveValue(user.firstName);
    await expect(page.locator("#lastName")).toHaveValue(user.lastName);
    await expect(page.locator("#email")).toHaveValue(user.email);
  });

  test("successfully updates first name, last name and diet preferences", async ({
    page,
  }) => {
    await setupAuthenticatedPage(page);

    await page.fill("#firstName", "Updated");
    await page.fill("#lastName", "Name");

    await page.locator('#diet-tags .tag[data-value="Vegan"]').click();

    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText(
      "Profile updated successfully.",
    );
  });

  test("profile changes persist after reload", async ({ page }) => {
    const user = await registerUser();
    const token = await loginUser(user.email, user.password);

    await page.goto("/login.html");
    await page.evaluate((t) => localStorage.setItem("token", t), token);
    await page.goto("/profile.html");
    await page.waitForSelector("#firstName");

    await page.fill("#firstName", "Persisted");
    await page.fill("#lastName", "Change");
    await page.locator('#diet-tags .tag[data-value="Keto"]').click();
    await page.click('button[type="submit"]');
    await expect(page.locator("#form-message")).toContainText(
      "Profile updated successfully.",
    );

    await page.reload();

    await expect(page.locator("#firstName")).toHaveValue("Persisted");
    await expect(page.locator("#lastName")).toHaveValue("Change");
    await expect(
      page.locator('#diet-tags .tag[data-value="Keto"]'),
    ).toHaveClass(/selected/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/profile.html");
    await page.evaluate(() => localStorage.removeItem("token"));
    await page.reload();

    await page.waitForURL(/login\.html/);
  });
});
