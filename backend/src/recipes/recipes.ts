import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";
import { PaginatedResponse, PaginationQuerySchema } from "@api/helpers/pagination";

export enum Unit {
  G = "g",
  ML = "ml",
  TBSP = "tbsp",
  TSP = "tsp",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export type Ingredient = {
  name: string;
  amount: number;
  unit: Unit;
};

export type Recipe = {
  id: number;
  authorId: number;
  name: string;
  ingredients: Ingredient[];
  prepTimeMinutes: number;
  prepSteps: string;
  cost: number;
  difficulty: Difficulty;
  dietaryTags: string[];
  allergens: string[];
  servings: number;
};

//Request Schemas
const createRecipeRequestSchema = z.object({
  //TODO
});

export type CreateRecipeRequest = z.infer<typeof createRecipeRequestSchema>;

const updateRecipeRequestSchema = z.object({
  //TODO
});

export type UpdateRecipeRequest = z.infer<typeof updateRecipeRequestSchema>;

const listRecipesRequestSchema = PaginationQuerySchema.extend({
  authors: z.array(z.number()).default([]),
});

export type ListRecipesRequest = z.infer<typeof listRecipesRequestSchema>;

export type ListRecipesResponse = PaginatedResponse<Recipe>;

// Interfaces
export interface IRecipesService {
  Create(authorId: number, request: CreateRecipeRequest): Promise<Recipe>;
  Update(userId: number, recipeId: number, request: UpdateRecipeRequest): Promise<void>;
  Delete(userId: number, recipeId: number): Promise<void>;
  List(req: Partial<ListRecipesRequest>): Promise<ListRecipesResponse>;
  Get(recipeId: number): Promise<Recipe>;
}

export interface IRecipesRepository {
  Create(recipe: Omit<Recipe, "id">): Promise<Recipe>;
  Update(userId: number, recipeId: number, recipe: Recipe): Promise<void>;
  Delete(userId: number, recipeId: number): Promise<void>;
  List(params: ListRecipesRequest): Promise<ListRecipesResponse>;
  Get(recipeId: number): Promise<Recipe>;
}

export class RecipesService implements IRecipesService {
  constructor(private repository: IRecipesRepository) {}

  async Create(authorId: number, request: CreateRecipeRequest): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async Update(userId: number, recipeId: number, request: UpdateRecipeRequest): Promise<void> {
    //TODO
    /*
    Putting this as reference for implementation
    const recipeId = Number(req.params.recipeId); 

    const existingRecipe = await service.Get(recipeId);

    if (existingRecipe.authorId !== authorId) {
      throw new ForbiddenError("you cannot delete this recipe");
    }
    */
    throw new Error("Method not implemented.");
  }

  async Delete(userId: number, recipeId: number): Promise<void> {
    await this.repository.Delete(userId, recipeId);
  }

  async List(rawQuery: Partial<ListRecipesRequest>): Promise<ListRecipesResponse> {
    const validation = listRecipesRequestSchema.safeParse(rawQuery);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    return this.repository.List(validation.data);
  }

  async Get(recipeId: number): Promise<Recipe> {
    return await this.repository.Get(recipeId);
  }
}
