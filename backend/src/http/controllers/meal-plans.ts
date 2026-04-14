import type { RequestHandler } from "express";
import { HttpStatus, UserIDFromRequest } from "@api/helpers/http";
import type { CreateMealPlanRequest, IMealPlansService, UpdateMealPlanRequest } from "@api/meal-plans";

export function HandleCreateMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const authorId = UserIDFromRequest(req);
    const mealPlanReq = req.body as CreateMealPlanRequest;

    const recipe = await service.Create(authorId, mealPlanReq);

    res.status(HttpStatus.Created).json(recipe);
  };
}

export function HandleUpdateMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const authorId = UserIDFromRequest(req);
    const mealPlanId = Number(req.params.id);
    const mealPlanReq = req.body as UpdateMealPlanRequest;

    await service.Update(authorId, mealPlanId, mealPlanReq);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleDeleteMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const authorId = UserIDFromRequest(req);
    const mealPlanId = Number(req.params.id);

    await service.Delete(authorId, mealPlanId);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleGetMealPlanByStartDate(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const userId = UserIDFromRequest(req);
    const rawQuery = req.query as Record<string, string>;

    const request = {
      startDate: rawQuery.startDate ? new Date(rawQuery.startDate) : undefined,
    };

    const mealPlans = await service.GetMealPlanByStartDate(userId, request);

    res.status(HttpStatus.Ok).json(mealPlans);
  };
}

export function HandleGetMealPlan(service: IMealPlansService): RequestHandler {
  return async (req, res) => {
    const mealPlanId = Number(req.params.id);

    const mealPlan = await service.Get(mealPlanId);

    res.status(HttpStatus.Ok).json(mealPlan);
  };
}
