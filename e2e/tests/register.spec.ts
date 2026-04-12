import { expect } from "@playwright/test";
import { registerUser, loginUser, test } from "./helpers";

test.describe("Register Account", () => {
  test("successful registration redirects to recipe page", async ({ page }) => {
    const email = `newuser.${Date.now()}@example.com`;

    await page.goto("/index.html");
    await page.fill("#firstName", "Jane");
    await page.fill("#lastName", "Doe");
    await page.fill("#email", email);
    await page.fill("#password", "Password123!");
    await page.fill("#confirm-password", "Password123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText("Account created successfully");

    await page.waitForURL(/recipe\.html/, { timeout: 10000 });
  });

  test("registering with an existing email shows error", async ({ page }) => {
    const existing = await registerUser();

    await page.goto("/index.html");
    await page.fill("#firstName", "Duplicate");
    await page.fill("#lastName", "User");
    await page.fill("#email", existing.email);
    await page.fill("#password", "Password123!");
    await page.fill("#confirm-password", "Password123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText("This email is already registered.");
  });
});
