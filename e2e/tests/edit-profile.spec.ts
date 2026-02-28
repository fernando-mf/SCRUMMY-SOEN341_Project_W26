import { Page } from "@playwright/test";
import {
  createApiContext,
  expect,
  loginUser,
  registerUser,
  test,
} from "./fixtures";

async function setupAuthenticatedPage(page: Page) {
  const api = await createApiContext();
  const user = await registerUser(api);
  const token = await loginUser(api, user.email, user.password);
  await api.dispose();

  await page.goto("/profile.html");
  await page.evaluate((t) => localStorage.setItem("token", t), token);
  await page.reload();

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
    const api = await createApiContext();
    const user = await registerUser(api);
    const token = await loginUser(api, user.email, user.password);
    await api.dispose();

    await page.goto("/profile.html");
    await page.evaluate((t) => localStorage.setItem("token", t), token);
    await page.reload();

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
