import type { RequestHandler } from "express";
import { HttpStatus } from "@api/helpers/http";
import type { CreateRecipeRequest, IRecipesService } from "@api/recipes/recipes";

export function HandleCreateRecipe(service: IRecipesService): RequestHandler {
    return async (req, res) => {
        const recipeReq = req.body as CreateRecipeRequest;
        
        const authReq = (req as any).user;
        const authorID = authReq.user.sub;

        const recipe = await service.Create(authorID, recipeReq);
        
        res.status(HttpStatus.Created).json(recipe);
    };
}