import postgres from "postgres";
import { NotFoundError } from "@api/helpers/errors";
import { IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async Update(userID: number, recipeID: number, recipe: Recipe): Promise<void> {
    //TODO
    /*
    Putting this as reference for implementation
    UPDATE recipes 
    SET name = :name, cost = :cost, ... 
    WHERE userId = :userId

    const result = await db`UPDATE ... WHERE userId = ${userId}`
    if (result.count == 0) {
      throw new NotFoundError("recipe")
    }
    */
    throw new Error("Method not implemented.");
  }

  async Delete(userID: number, recipeID: number): Promise<void> {
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
