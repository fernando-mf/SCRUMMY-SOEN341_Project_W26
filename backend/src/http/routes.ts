import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import type { Core } from "@api/core";
import { HandleCreateUser, HandleGetUser, HandleRegister, HandleUpdateUser } from "@api/http/controllers/users";
import spec from "@api/http/docs/swagger.json";

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

  // Swagger UI
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

  // Users routes
  router.get("/users/:id", HandleGetUser(core.UsersService));
  router.put("/users/:id", HandleUpdateUser(core.UsersService));
  router.post("/users", HandleCreateUser(core.UsersService));
  router.post("/register", HandleRegister(core.UsersService));

  return router;
}
