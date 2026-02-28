import { createApiContext, expect, registerUser, test } from "./fixtures";

test.describe("Login", () => {
  test("successful login redirects to recipe page and stores token", async ({
    page,
  }) => {
    const api = await createApiContext();
    const user = await registerUser(api);
    await api.dispose();

    await page.goto("/login.html");
    await page.fill("#email", user.email);
    await page.fill("#password", user.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/recipe\.html/);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
  });

  test("wrong password shows error message", async ({ page }) => {
    const api = await createApiContext();
    const user = await registerUser(api);
    await api.dispose();

    await page.goto("/login.html");
    await page.fill("#email", user.email);
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText(
      "Account not found or wrong password."
    );
  });

  test("non-existent user shows error message", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill("#email", "nobody@example.com");
    await page.fill("#password", "somepassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("#form-message")).toContainText(
      "Account not found or wrong password."
    );
  });
});
