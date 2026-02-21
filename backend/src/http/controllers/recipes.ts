import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type {
  CreateRecipeRequest,
  IRecipesService,
  ListRecipesRequest,
  UpdateRecipeRequest,
} from "@api/recipes/recipes";

export function HandleCreateRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const recipeReq = req.body as CreateRecipeRequest;

    const authReq = (req as any).user;
    const authorID = authReq.user.sub;

    const recipe = await service.Create(authorID, recipeReq);

    res.status(HttpStatus.Created).json(recipe);
  };
}

export function HandleUpdateRecipe(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const recipeID = Number(req.params.recipeID);

    const recipe = req.body as UpdateRecipeRequest;

    await service.Update(recipeID, recipe);

    res.status(HttpStatus.NoContent).send();
  };
}

export function HandleListRecipes(service: IRecipesService): RequestHandler {
  return async (req, res) => {
    const recipesRequest = req.query as unknown as ListRecipesRequest;

    const recipes = await service.List(recipesRequest);

    res.status(HttpStatus.Ok).json(recipes);
  };
}
