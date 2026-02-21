import postgres from "postgres";
import { IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async List(req: ListRecipesRequest): Promise<ListRecipesResponse> {
    throw new Error("Method not implemented.");
  }
}
