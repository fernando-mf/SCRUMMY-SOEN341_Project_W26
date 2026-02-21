import { PaginatedResponse } from "@api/helpers/pagination";
import { CreateRecipeRequest, IRecipesService, ListRecipesRequest, Recipe, UpdateRecipeRequest } from "@api/recipes";
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

  List(req: ListRecipesRequest): Promise<PaginatedResponse<Recipe>> {
    throw new Error("Method not implemented.");
  }
}
