import type { RequestHandler } from "express";
import { AuthenticationError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { CreateMealPlanRequest, IMealPlansService } from "@api/meal-plans";

export function HandleCreateMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorId = parseInt(auth?.sub);
    if (isNaN(authorId)) {
      throw new AuthenticationError("invalid token");
    }

    const mealPlanReq = req.body as CreateMealPlanRequest;

    const recipe = await service.Create(authorId, mealPlanReq);

    res.status(HttpStatus.Created).json(recipe);
  };
}