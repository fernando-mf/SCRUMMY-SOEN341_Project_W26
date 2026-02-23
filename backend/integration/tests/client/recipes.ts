import { PaginatedResponse } from "@api/helpers/pagination";
import { CreateRecipeRequest, IRecipesService, ListRecipesRequest, Recipe, UpdateRecipeRequest } from "@api/recipes";
import { ApiClient } from "./internal";

export class RecipesHttpClient implements IRecipesService {
  constructor(private client: ApiClient) {}

  Create(authorId: number, request: CreateRecipeRequest): Promise<Recipe> {
    return this.client.Request({
      url: "/api/recipes",
      method: "POST",
      body: request,
    });
  }

  Update(userID: number, recipeID: number, request: UpdateRecipeRequest): Promise<void> {
    //TODO
    throw new Error("Method not implemented.");
  }

  Delete(userID: number, recipeID: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  List(req: ListRecipesRequest): Promise<PaginatedResponse<Recipe>> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req)) {
      const serialized = Array.isArray(value) ? value.join(",") : value.toString();
      params.append(key, serialized);
    }

    return this.client.Request({
      url: `/api/recipes?${params}`,
      method: "GET",
    });
  }

  Get(recipeID: number): Promise<Recipe> {
    throw new Error("Method not implemented.");
  }
}
