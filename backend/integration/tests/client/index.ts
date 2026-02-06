import { Core } from "@api/core";
import { ApiClient } from "./internal";
import { UsersHttpClient } from "./users";

interface Client extends Core {
  SetAccessToken(token: string): void;
}

export function NewClient(): Client {
  const baseUrl = process.env.API_URL ?? "http://localhost:3000";
  if (!baseUrl) {
    throw new Error("API_URL is not set");
  }

  const client = new ApiClient(baseUrl);

  return {
    SetAccessToken: (token: string) => {
      client.SetAccessToken(token);
    },

    UsersService: new UsersHttpClient(client),
  };
}
