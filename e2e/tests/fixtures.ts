import { test as base, request as baseRequest } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:3000/api";

export { expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((url) => {
      (window as unknown as Record<string, unknown>).__BASE_URL__ = url;
    }, API_URL);
    await use(page);
  },
});

export async function createApiContext() {
  return baseRequest.newContext({ baseURL: API_URL });
}

export interface UserCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  token: string;
}

export async function registerUser(
  apiContext: Awaited<ReturnType<typeof createApiContext>>,
  overrides: Partial<Omit<UserCredentials, "token">> = {}
): Promise<UserCredentials> {
  const suffix = Date.now();
  const creds = {
    firstName: overrides.firstName ?? "Test",
    lastName: overrides.lastName ?? "User",
    email: overrides.email ?? `test.user.${suffix}@example.com`,
    password: overrides.password ?? "Password123!",
  };

  const res = await apiContext.post("/auth/register", { data: creds });
  if (!res.ok()) {
    throw new Error(`Failed to register user: ${await res.text()}`);
  }
  const body = await res.json();
  return { ...creds, token: body.token };
}

export async function loginUser(
  apiContext: Awaited<ReturnType<typeof createApiContext>>,
  email: string,
  password: string
): Promise<string> {
  const res = await apiContext.post("/auth/login", {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`Failed to login: ${await res.text()}`);
  }
  const body = await res.json();
  return body.token;
}
