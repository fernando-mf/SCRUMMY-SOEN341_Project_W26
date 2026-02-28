import { test as base, request } from "@playwright/test";

const API_URL = (process.env.API_URL || "http://127.0.0.1:3000/api").replace(
  /\/$/,
  "",
);

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

export async function registerUser(
  overrides: Partial<Omit<UserCredentials, "token">> = {},
): Promise<UserCredentials> {
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

export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
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
