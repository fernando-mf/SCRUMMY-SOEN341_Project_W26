import { test as base, Page, request } from "@playwright/test";

const API_URL = (process.env.API_URL || "http://127.0.0.1:3000/api").replace(/\/$/, "");

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((url) => {
      (window as any).__BASE_URL__ = url;
    }, API_URL);
    await use(page);
  },
});

export interface UserCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  token: string;
}

export async function registerUser(overrides: Partial<Omit<UserCredentials, "token">> = {}): Promise<UserCredentials> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const creds = {
    firstName: overrides.firstName ?? "Test",
    lastName: overrides.lastName ?? "User",
    email: overrides.email ?? `test.user.${suffix}@example.com`,
    password: overrides.password ?? "Password123!",
  };

  const apiContext = await request.newContext();
  const res = await apiContext.post(`${API_URL}/auth/register`, {
    data: creds,
  });
  if (!res.ok()) {
    throw new Error(`Failed to register user: ${await res.text()}`);
  }
  const body = await res.json();
  return { ...creds, token: body.token };
}

export async function loginUser(email: string, password: string): Promise<string> {
  const apiContext = await request.newContext();
  const res = await apiContext.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`Failed to login: ${await res.text()}`);
  }
  const body = await res.json();
  return body.token;
}

export async function setupAuthenticatedPage(page: Page, targetPath = "/profile.html", waitSelector = "#firstName") {
  const user = await registerUser();
  const token = await loginUser(user.email, user.password);

  await page.goto("/login.html");
  await page.evaluate((t) => localStorage.setItem("token", t), token);
  await page.goto(targetPath);
  await page.waitForSelector(waitSelector);

  return user;
}

export async function fillRecipeForm(page: Page, recipeName: string) {
  await page.fill("#recipe-name", recipeName);
  await page.fill("#cook-time", "20");
  await page.fill("#servings", "2");
  await page.selectOption("#difficulty", "easy");

  // Add one ingredient
  await page.fill("#ingredient-name", "Flour");
  await page.fill("#ingredient-amount", "200");
  await page.selectOption("#ingredient-unit", "g");
  await page.click("#add-ingredient-btn");

  // Add one preparation step
  await page.click("#add-step-btn");
  await page.fill(".step-input", "Mix all ingredients together");

  // Blur the textarea so the change event fires and updates the steps array
  await page.locator(".step-input").evaluate((el) => el.blur());
}
