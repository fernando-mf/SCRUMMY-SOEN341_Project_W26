import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import type { Core } from "@api/core";
import { HandleCreateUser, HandleLogin } from "@api/http/controllers/auth";
import {
  HandleCreateRecipe,
  HandleDeleteRecipe,
  HandleGenerateRecipe,
  HandleGetRecipe,
  HandleListRecipes,
  HandleUpdateRecipe,
} from "@api/http/controllers/recipes";
import { HandleCreateMealPlan, HandleDeleteMealPlan, HandleGetMealPlan, HandleUpdateMealPlan } from "@api/http/controllers/meal-plans";
import { HandleGetUser, HandleUpdateUser } from "@api/http/controllers/users";
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

  // Auth routes
  router.post("/auth/register", HandleCreateUser(core.UsersService));
  router.post("/auth/login", HandleLogin(core.UsersService));

  router.use(RequireAuth);

  // Users routes
  router.get("/users", HandleGetUser(core.UsersService));
  router.put("/users", HandleUpdateUser(core.UsersService));

  // Recipe routes
  router.post("/recipes", HandleCreateRecipe(core.RecipesService));
  router.put("/recipes/:id", HandleUpdateRecipe(core.RecipesService));
  router.delete("/recipes/:id", HandleDeleteRecipe(core.RecipesService));
  router.get("/recipes/:id", HandleGetRecipe(core.RecipesService));
  router.get("/recipes", HandleListRecipes(core.RecipesService));
  router.post("/recipes/generate", HandleGenerateRecipe(core.RecipesService));

  // Meal Plan routes
  router.post("/meal-plans", HandleCreateMealPlan(core.MealPlansService));
  router.put("/meal-plans/:id", HandleUpdateMealPlan(core.MealPlansService));
  router.delete("/meal-plans/:id", HandleDeleteMealPlan(core.MealPlansService));
  router.get("/meal-plans/:id", HandleGetMealPlan(core.MealPlansService));

  return router;
}
