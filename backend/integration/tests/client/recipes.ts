import { CreateRecipeRequest, IRecipesService, Recipe, UpdateRecipeRequest } from "@api/recipes";
import { ApiClient } from "./internal";

export class RecipesHttpClient implements IRecipesService {
    constructor(private client: ApiClient) {}

    Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe> {
        //TODO
        throw new Error("Method not implemented.");
    }

    Update(recipeID: number, request: UpdateRecipeRequest): Promise<void> {
        //TODO
        throw new Error("Method not implemented.");
    }

}