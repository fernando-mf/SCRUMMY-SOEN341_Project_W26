import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["integration/tests/**/*.test.ts"],
    testTimeout: 10000,
    hookTimeout: 30000,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "./src"),
    },
  },
});
