import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import type { Core } from "@api/core";
import { HandleLogin } from "@api/http/controllers/auth";
import { HandleCreateUser, HandleGetUser, HandleUpdateUser } from "@api/http/controllers/users";
import spec from "@api/http/docs/swagger.json"; //  this is generated automatically after running `npm run dev` or `npm run build`
import { RequireAuth } from "@api/http/middleware";

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
  router.post("/auth/register", HandleCreateUser(core.UsersService));
  router.post("/auth/login", HandleLogin(core.UsersService));

  router.use(RequireAuth);

  router.get("/users", HandleGetUser(core.UsersService));
  router.put("/users", HandleUpdateUser(core.UsersService));
  // Add more routes here
  // ...

  return router;
}
