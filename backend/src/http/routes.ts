import { Router } from "express";
import type { Core } from "@api/core";
import { HandleGetUser, HandleUpdateUser } from "./users";

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

  // users routes
  router.get("/users/:id", HandleGetUser(core.UsersService));
  router.put("/users/:id", HandleUpdateUser(core.UsersService));

  // Add more routes here
  // ...

  return router;
}
