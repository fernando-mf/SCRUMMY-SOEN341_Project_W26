import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type {
  CreateRecipeRequest,
  IRecipesService,
  ListRecipesRequest,
  UpdateRecipeRequest,
} from "@api/recipes/recipes";
import { AuthenticationError, ForbiddenError } from "@api/helpers/errors";

export function HandleCreateRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorID = parseInt(auth?.sub);
    if (isNaN(authorID)) {
      throw new AuthenticationError("invalid token");
    }

    const recipeReq = req.body as CreateRecipeRequest;

    const recipe = await service.Create(authorID, recipeReq);

    res.status(HttpStatus.Created).json(recipe);
  };
}

export function HandleUpdateRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorID = parseInt(auth?.sub);
    if (isNaN(authorID)) {
      throw new AuthenticationError("invalid token");
    }

    const recipeID = Number(req.params.id);
    const recipeReq = req.body as UpdateRecipeRequest;

    await service.Update(authorID, recipeID, recipeReq);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleDeleteRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const auth = (req as any).auth;
    const authorID = parseInt(auth?.sub);
    if (isNaN(authorID)) {
      throw new AuthenticationError("invalid token");
    }

    const recipeID = Number(req.params.id);

    await service.Delete(authorID, recipeID);

    res.status(HttpStatus.NoContent).send();
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
