import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { Ingredient, IRecipesRepository, ListRecipesRequest, ListRecipesResponse, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
  constructor(private db: postgres.Sql) {}

  async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    const result = await this.db<{ id: number }[]>`
    INSERT INTO recipes (
      "authorId",
      "name",
      "prepTimeMinutes",
      "prepSteps",
      "cost",
      "difficulty",
      "dietaryTags",
      "allergens",
      "servings"
    ) VALUES (
      ${recipe.authorId},
      ${recipe.name},
      ${recipe.prepTimeMinutes},
      ${recipe.prepSteps},
      ${recipe.cost},
      ${recipe.difficulty},
      ${recipe.dietaryTags},
      ${recipe.allergens},
      ${recipe.servings}
    ) RETURNING "id"
  `;

    const recipeId = result[0].id;

    if (recipe.ingredients.length > 0) {
      const ingredientRows = recipe.ingredients.map((i) => ({
        recipeId,
        name: i.name,
        amount: i.amount,
        unit: i.unit,
      }));

      await this.db`
      INSERT INTO recipe_ingredients ${this.db(ingredientRows)}
    `;
    }

    return {
      id: recipeId,
      ...recipe,
    };
  }

  async Update(userId: number, recipeId: number, recipe: Recipe): Promise<void> {
    const result = await this.db`
      UPDATE recipes
      SET
        "name" = ${recipe.name},
        "prepTimeMinutes" = ${recipe.prepTimeMinutes},
        "prepSteps" = ${recipe.prepSteps},
        "cost" = ${recipe.cost},
        "difficulty" = ${recipe.difficulty},
        "dietaryTags" = ${recipe.dietaryTags},
        "allergens" = ${recipe.allergens},
        "servings" = ${recipe.servings},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${recipeId}
        AND "authorId" = ${userId}
    `;

    if (result.count === 0) {
      throw new NotFoundError("recipe");
    }

    if (recipe.ingredients !== undefined) {
      await this.db`
        DELETE FROM recipe_ingredients
        WHERE "recipeId" = ${recipeId}
      `;

      if (recipe.ingredients.length > 0) {
        const rows = recipe.ingredients.map(i => ({
          recipeId: recipeId,
          name: i.name,
          amount: i.amount,
          unit: i.unit,
        }));

        await this.db`
          INSERT INTO recipe_ingredients ${this.db(rows)}
        `;
      }
    }
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
        ${this.applyIfSet(req.search, this.db`AND r."name" ILIKE ${"%" + req.search + "%"}`)}
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

  async Get(recipeId: number): Promise<Recipe> {
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
    WHERE r."id" = ${recipeId}
  `;

    if (rawRecipes.length === 0) {
      throw new NotFoundError("recipe");
    }

    const recipesWithIngredients = await this.fillIngredients(rawRecipes);

    return recipesWithIngredients[0];
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

  private applyIfSet<T>(val: T[] | T, fragment: any) {
    let isValid = Boolean(val);
    if (Array.isArray(val)) {
      isValid = val.length > 0;
    }

    return isValid ? fragment : this.db``;
  }
}
