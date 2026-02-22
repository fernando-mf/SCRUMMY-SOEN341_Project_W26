import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type { CreateRecipeRequest, IRecipesService, ListRecipesRequest } from "@api/recipes/recipes";

export function HandleCreateRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const recipeReq = req.body as CreateRecipeRequest;

    const authReq = (req as any).user;
    const authorID = authReq.user.sub;

    const recipe = await service.Create(authorID, recipeReq);

    res.status(HttpStatus.Created).json(recipe);
  };
}

export function HandleListRecipes(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const rawQuery = req.query as Record<string, string>;

    const request: Partial<ListRecipesRequest> = {
      page: parseNumber(rawQuery.page),
      limit: parseNumber(rawQuery.limit),
      authors: rawQuery.authors ? rawQuery.authors.split(",").map(Number) : [],
    };

    const recipes = await service.List(request);

    res.status(HttpStatus.Ok).json(recipes);
  };
}

function parseNumber(value?: string): number | undefined {
  if (value) {
    return Number(value);
  }
}
