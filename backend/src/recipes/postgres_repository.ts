import postgres from "postgres";
import { InternalError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { Ingredient, IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async List(req: ListRecipesRequest): Promise<ListRecipesResponse> {
    const countResult = await this.db`
      SELECT COUNT(*) as total
      FROM recipes
    `;
    const total = Number(countResult[0].total);
    if (isNaN(total)) {
      throw new InternalError("Failed to count recipes");
    }

    const { offset, totalPages } = GetPaginationParams(total, req);

    const rawRecipes = await this.db<Recipe[]>`
      SELECT
        r."id",
        r."authorID",
        r."name",
        r."prepTimeMinutes",
        r."prepSteps",
        r."cost",
        r."difficulty",
        r."dietaryTags",
        r."allergens",
        r."servings"
      FROM recipes r
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
}
