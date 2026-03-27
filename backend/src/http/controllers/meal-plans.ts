import type { RequestHandler } from "express";
import { AuthenticationError } from "@api/helpers/errors";
import { HttpStatus } from "@api/helpers/http";
import type { CreateMealPlanRequest, IMealPlansService, UpdateMealPlanRequest } from "@api/meal-plans";

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

export function HandleUpdateMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorId = parseInt(auth?.sub);
    if (isNaN(authorId)) {
      throw new AuthenticationError("invalid token");
    }

    const mealPlanId = Number(req.params.id);
    const mealPlanReq = req.body as UpdateMealPlanRequest;

    await service.Update(authorId, mealPlanId, mealPlanReq);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleDeleteMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorId = parseInt(auth?.sub);
    if (isNaN(authorId)) {
      throw new AuthenticationError("invalid token");
    }

    const mealPlanId = Number(req.params.id);

    await service.Delete(authorId, mealPlanId);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const userId = parseInt(auth?.sub);
    if (isNaN(userId)) {
      throw new AuthenticationError("invalid token");
    }

    const mealPlanId = Number(req.params.id);
    const mealPlan = await service.Get(mealPlanId);

    res.status(HttpStatus.Ok).json(mealPlan);
  };
}
