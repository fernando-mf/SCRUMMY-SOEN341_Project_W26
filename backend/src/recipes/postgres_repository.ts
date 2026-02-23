import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { Ingredient, IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async Update(userId: number, recipeId: number, recipe: Recipe): Promise<void> {
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

  async Delete(userId: number, recipeId: number): Promise<void> {
    const result = await this.db`
      DELETE FROM recipes
      WHERE "id" = ${recipeId}
        AND "authorId" = ${userId}
    `;

    if (result.count === 0) {
      throw new NotFoundError("recipe");
    }
  }

  async List(req: ListRecipesRequest): Promise<ListRecipesResponse> {
    const whereClause = this.db`
      WHERE true
        ${this.applyIfSet(req.authors, this.db`AND r."authorId" IN ${this.db(req.authors)}`)}
    `;

    const countResult = await this.db<{ total: number }[]>`
      SELECT COUNT(DISTINCT r."id") as total
      FROM recipes r
      ${whereClause}
    `;
    const total = Number(countResult[0].total);
    if (isNaN(total)) {
      throw new InternalError("Failed to count recipes");
    }

    const { offset, totalPages } = GetPaginationParams(total, req);

    const rawRecipes = await this.db<Recipe[]>`
      SELECT
        r."id",
        r."authorId",
        r."name",
        r."prepTimeMinutes",
        r."prepSteps",
        r."cost",
        r."difficulty",
        r."dietaryTags",
        r."allergens",
        r."servings"
      FROM recipes r
      ${whereClause}
      LIMIT ${req.limit}
      OFFSET ${offset}
    `;

    const recipes = await this.fillIngredients(rawRecipes);

    return {
      currentPage: req.page,
      totalCount: total,
      totalPages: totalPages,
      data: recipes,
    };
  }

  private async fillIngredients(recipes: Recipe[]): Promise<Recipe[]> {
    if (recipes.length === 0) {
      return [];
    }

    type rawIngredient = Ingredient & {
      recipeId: number;
    };

    const recipeIds = recipes.map((r) => r.id);
    const ingredients = await this.db<rawIngredient[]>`
      SELECT
        "recipeId",
        "name",
        "amount",
        "unit"
      FROM recipe_ingredients
      WHERE "recipeId" IN ${this.db(recipeIds)}
    `;

    const indexedIngredients: Record<number, Ingredient[]> = {};
    for (const i of ingredients) {
      (indexedIngredients[i.recipeId] ??= []).push({
        amount: i.amount,
        name: i.name,
        unit: i.unit,
      });
    }

    return recipes.map((r) => ({
      ...r,
      ingredients: indexedIngredients[r.id] ?? [],
    }));
  }

  async Get(recipeId: number): Promise<Recipe> {
    const recipe = await this.db`
    SELECT * FROM recipes WHERE id = ${recipeId}`;

    if (recipe.length === 0) {
      throw new NotFoundError("recipe");
    }

    return recipe[0] as Recipe;
  }

  private applyIfSet<T>(val: T[] | T, fragment: any) {
    let isValid = Boolean(val);
    if (Array.isArray(val)) {
      isValid = val.length > 0;
    }

    return isValid ? fragment : this.db``;
  }
}
