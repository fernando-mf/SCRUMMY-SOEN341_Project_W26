import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";
import { PaginatedResponse, PaginationQuerySchema } from "@api/helpers/pagination";

export enum Unit {
  G = "g",
  ML = "ml",
  TBSP = "tbsp",
  TSP = "tsp",
  CUP = "cup",
  CLOVES = "cloves",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

export type Recipe = {
  id: number;
  authorId: number;
  name: string;
  ingredients: Ingredient[];
  prepTimeMinutes: number;
  prepSteps: string;
  cost: number;
  difficulty: string;
  dietaryTags: string[];
  allergens: string[];
  servings: number;
};

//Request Schemas

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(["g", "ml", "tbsp", "tsp", "cup", "cloves"] as const),
});

const createRecipeRequestSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(ingredientSchema).min(1),
  prepTimeMinutes: z.number().int().positive(),
  prepSteps: z.string().min(1),
  cost: z.number().nonnegative(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  servings: z.number().int().positive(),
});

export type CreateRecipeRequest = z.infer<typeof createRecipeRequestSchema>;

const updateRecipeRequestSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(ingredientSchema).min(1),
  prepTimeMinutes: z.number().int().positive(),
  prepSteps: z.string().min(1),
  cost: z.number().nonnegative(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  servings: z.number().int().positive(),
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
    const validation = createRecipeRequestSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const createdRecipe = this.repository.Create({
      authorId,
      ...validation.data
    });

    return createdRecipe;
  }

  async Update(userId: number, recipeId: number, request: UpdateRecipeRequest): Promise<void> {
    const validation = updateRecipeRequestSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const currentRecipe = await this.repository.Get(recipeId);

    const updatedRecipe: Recipe = {
      id: currentRecipe.id,
      authorId: currentRecipe.authorId,
      name: request.name,
      ingredients: request.ingredients,
      prepTimeMinutes: request.prepTimeMinutes,
      prepSteps: request.prepSteps,
      cost: request.cost,
      difficulty: request.difficulty,
      dietaryTags: request.dietaryTags,
      allergens: request.allergens,
      servings: request.servings,
    }

    await this.repository.Update(userId, recipeId, updatedRecipe);
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
