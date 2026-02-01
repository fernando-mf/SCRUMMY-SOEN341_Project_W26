import { Router } from "express";
import type { Core } from "@api/core";

export function Routes(core: Core) {
  const router = Router();

  // Health check
  router.get("/status", (req, res) => {
    res.json({
      status: "ok",
      name: "MealMajor API",
      version: "1.0.0",
    });
  });

  // Add more route here
  // ...

  return router;
}
