import postgres from "postgres";
import { NotFoundError } from "@api/helpers/errors";
import { IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async Update(recipeID: number, recipe: Recipe): Promise<void> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async Delete(recipeID: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async List(req: ListRecipesRequest): Promise<ListRecipesResponse> {
    throw new Error("Method not implemented.");
  }

  async Get(recipeID: number): Promise<Recipe> {
    const recipe = await this.db`
    SELECT * FROM recipes WHERE id = ${recipeID}`;

    if (recipe.length === 0) {
      throw new NotFoundError("recipe");
    }

    return recipe[0] as Recipe;
  }
}
